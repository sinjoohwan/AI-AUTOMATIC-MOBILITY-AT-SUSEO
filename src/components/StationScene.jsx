import React, { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, Line, OrbitControls, Text, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { AMENITY_STYLE, BOUNDS, ROBOT_RADIUS, amenities, boundsFor, elevatorCars, floorDetails, footprintRings, geofences, nodes, pillars, stationAreas, trackBeds } from '../simulation.js';

const FLOOR_SHIFT = { '1F': -20, B1: 20 };
const FLOOR_TITLE = { '1F': '지하 1층 내부', B1: '지하 2층 내부' };

function shiftOf(floor) {
  return FLOOR_SHIFT[floor] || 0;
}

function focusPoint(robot) {
  if (robot.elevator) {
    const t = Math.min(1, robot.elevator.elapsed / robot.elevator.duration);
    const from = shiftOf(robot.elevator.fromFloor);
    const to = shiftOf(robot.elevator.toFloor);
    return new THREE.Vector3(robot.x + from + (to - from) * t, 0.55, robot.z);
  }
  return new THREE.Vector3(robot.x + shiftOf(robot.floor), 0.35, robot.z);
}

const architecture = [
  {
    file: '/models/station-1f.glb',
    floor: '1F',
    scale: 0.12,
    sourceCenter: [111.1236, -73.2111],
    targetCenter: [0, 0],
    sourceFloor: 1.196,
  },
  {
    file: '/models/station-b1.glb',
    floor: 'B1',
    scale: 0.08,
    sourceCenter: [128.9716, -72.4975],
    targetCenter: [0, 0.5],
    sourceFloor: -3.085,
  },
  {
    file: '/models/station-b2-concourse.glb',
    floor: 'B2',
    scale: 0.09,
    sourceCenter: [38.8114, -47.9208],
    targetCenter: [-6.7, 0.8],
    sourceFloor: -11.32,
  },
  {
    file: '/models/station-b2-platform.glb',
    floor: 'B2',
    scale: 0.04,
    sourceCenter: [281.2421, -61.5445],
    targetCenter: [1.8, -1.7],
    sourceFloor: -10.5,
  },
];

function configureGltfLoader(loader) {
  loader.setMeshoptDecoder(MeshoptDecoder);
}

function shapeGeometry(points) {
  const shape = new THREE.Shape();
  points.forEach(([x, z], index) => {
    if (index === 0) shape.moveTo(x, -z);
    else shape.lineTo(x, -z);
  });
  const geometry = new THREE.ShapeGeometry(shape);
  const xs = points.map((point) => point[0]);
  const zs = points.map((point) => point[1]);
  geometry.userData.span = [Math.max(...xs) - Math.min(...xs), Math.max(...zs) - Math.min(...zs)];
  return geometry;
}

function useFloorTexture(span) {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#e4e9f0';
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = '#dde3ec';
    ctx.fillRect(6, 6, 116, 116);
    ctx.strokeStyle = 'rgba(126, 142, 160, 0.55)';
    ctx.lineWidth = 3;
    ctx.strokeRect(6, 6, 116, 116);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(Math.max(span[0] / 1.7, 1), Math.max(span[1] / 1.7, 1));
    return texture;
  }, [span[0], span[1]]);
}

function StationShell({ floor, selectable, onSelectPoint }) {
  const shift = shiftOf(floor);
  const rings = useMemo(() => footprintRings(floor), [floor]);
  const geometries = useMemo(() => rings.map((points) => shapeGeometry(points)), [floor]);
  const texture = useFloorTexture(geometries[0]?.userData.span || [1, 1]);
  const walls = useMemo(() => rings.flatMap((points) => points.map((point, index) => {
    const next = points[(index + 1) % points.length];
    const dx = next[0] - point[0];
    const dz = next[1] - point[1];
    const length = Math.hypot(dx, dz);
    return {
      x: (point[0] + next[0]) / 2,
      z: (point[1] + next[1]) / 2,
      length,
      rotation: Math.atan2(dx, dz),
    };
  })), [floor]);
  const tracks = useMemo(() => (trackBeds[floor] || []).map((bed) => {
    const xs = bed.map((point) => point[0]);
    const zs = bed.map((point) => point[1]);
    const spanX = Math.max(...xs) - Math.min(...xs);
    const spanZ = Math.max(...zs) - Math.min(...zs);
    return {
      geometry: shapeGeometry(bed),
      midX: (Math.min(...xs) + Math.max(...xs)) / 2,
      midZ: (Math.min(...zs) + Math.max(...zs)) / 2,
      alongX: spanX >= spanZ,
      span: Math.max(spanX, spanZ),
    };
  }), [floor]);
  const detail = floorDetails[floor] || {};
  return (
    <group position={[shift, 0, 0]}>
      {tracks.map((bed, index) => (
        <mesh key={`track-${index}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} geometry={bed.geometry}>
          <meshStandardMaterial color="#2a313b" roughness={0.92} />
        </mesh>
      ))}
      {geometries.map((geometry, index) => (
        <mesh key={`deck-${index}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} geometry={geometry} receiveShadow>
          <meshStandardMaterial map={texture} color="#f3f6fa" roughness={0.84} metalness={0.02} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {detail.aisle && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[detail.aisle.x, 0.035, detail.aisle.z]}>
          <planeGeometry args={[detail.aisle.w, detail.aisle.d]} />
          <meshStandardMaterial color="#d9cbb8" roughness={0.9} />
        </mesh>
      )}
      {(detail.queues || []).map((line, index) => (
        <mesh key={`queue-${index}`} rotation={[-Math.PI / 2, 0, 0]} position={[line.x, 0.045, line.z]}>
          <planeGeometry args={[line.w, line.d]} />
          <meshBasicMaterial color="#7eb6e8" />
        </mesh>
      ))}
      {(detail.safety || []).map((line, index) => (
        <mesh key={`safety-${index}`} rotation={[-Math.PI / 2, 0, 0]} position={[line.x, 0.04, line.z]}>
          <planeGeometry args={[line.w, line.d]} />
          <meshBasicMaterial color="#f0c24b" />
      </mesh>
      ))}
      {tracks.map((bed, index) => [-0.28, 0.28].map((offset) => (
        <mesh
          key={`rail-${index}-${offset}`}
          position={[bed.midX + (bed.alongX ? 0 : offset), 0.05, bed.midZ + (bed.alongX ? offset : 0)]}
        >
          <boxGeometry args={bed.alongX ? [bed.span, 0.04, 0.05] : [0.05, 0.04, bed.span]} />
          <meshStandardMaterial color="#c5ccd4" metalness={0.6} roughness={0.35} />
        </mesh>
      )))}
      {walls.map((wall) => (
        <group key={`${wall.x}:${wall.z}`} position={[wall.x, 0, wall.z]} rotation={[0, wall.rotation, 0]}>
          <mesh position={[0, 0.48, 0]} castShadow>
            <boxGeometry args={[0.16, 0.96, wall.length]} />
            <meshStandardMaterial color="#f7f5f1" roughness={0.78} />
          </mesh>
          <mesh position={[0, 0.98, 0]}>
            <boxGeometry args={[0.18, 0.06, wall.length]} />
            <meshStandardMaterial color="#0054A6" roughness={0.5} />
          </mesh>
        </group>
      ))}
      {selectable && geometries.map((geometry, index) => (
        <mesh key={`pick-${index}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} geometry={geometry} onClick={onSelectPoint}>
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

function StationArchitecture({ model }) {
  const { scene } = useGLTF(model.file, true, true, configureGltfLoader);
  const shift = shiftOf(model.floor);
  const clipped = useMemo(() => {
    const clone = scene.clone(true);
    const planes = [
      new THREE.Plane(new THREE.Vector3(1, 0, 0), -(shift + BOUNDS.minX)),
      new THREE.Plane(new THREE.Vector3(-1, 0, 0), shift + BOUNDS.maxX),
      new THREE.Plane(new THREE.Vector3(0, 0, 1), -BOUNDS.minZ),
      new THREE.Plane(new THREE.Vector3(0, 0, -1), BOUNDS.maxZ),
      new THREE.Plane(new THREE.Vector3(0, 1, 0), 1.2),
      new THREE.Plane(new THREE.Vector3(0, -1, 0), 3.2),
    ];
    clone.traverse((object) => {
      if (!object.isMesh || !object.material) return;
      const source = Array.isArray(object.material) ? object.material : [object.material];
      object.material = source.map((material) => {
        const next = material.clone();
        next.clippingPlanes = planes;
        next.clipShadows = true;
        next.side = THREE.DoubleSide;
        return next;
      });
    });
    return clone;
  }, [scene, shift]);
  const position = [
    shift + model.targetCenter[0] - model.sourceCenter[0] * model.scale,
    -model.sourceFloor * model.scale,
    model.targetCenter[1] - model.sourceCenter[1] * model.scale,
  ];
  return <primitive object={clipped} position={position} scale={model.scale} dispose={null} />;
}

function ElevatorCars({ floor }) {
  const shift = shiftOf(floor);
  return elevatorCars.filter((car) => !car.floors || car.floors.includes(floor)).map((car) => (
    <group key={car.id} position={[car.x + shift, 0.55, car.z]}>
      <mesh>
        <boxGeometry args={[car.w, 1.1, car.d]} />
        <meshStandardMaterial color="#0054A6" roughness={0.45} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0, car.d / 2 + 0.02]}>
        <boxGeometry args={[car.w * 0.72, 0.72, 0.04]} />
        <meshStandardMaterial color="#d6e8ff" roughness={0.3} />
      </mesh>
      <Text position={[0, 0.62, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.42} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.028} outlineColor="#042656">
        {car.label}
      </Text>
    </group>
  ));
}

function AmenityMeshes({ floor }) {
  const shift = shiftOf(floor);
  return amenities.filter((item) => item.floor === floor).map((item) => {
    const style = AMENITY_STYLE[item.kind];
    const label = item.label ?? style.label;
    const fontSize = Math.min(0.68, Math.max(0.46, (Math.max(item.w, 1.4) * 0.9) / Math.max([...label].length, 2)));
    const height = item.kind === 'seat' ? 0.28 : item.kind === 'ticket' || item.kind === 'counter' || item.kind === 'police' ? 0.9 : item.kind === 'kiosk' ? 1.05 : 0.7;
    return (
      <group key={item.id} position={[item.x + shift, height / 2, item.z]}>
        <mesh>
          <boxGeometry args={[item.w, height, item.d]} />
          <meshStandardMaterial color={style.color} roughness={0.62} />
        </mesh>
        {label ? (
          <Text position={[0, height / 2 + 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={fontSize} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.035} outlineColor="#07111e">
            {label}
          </Text>
        ) : null}
      </group>
    );
  });
}

function spatialFrame(floor) {
  const bounds = boundsFor(floor);
  const shift = shiftOf(floor);
  const cx = (bounds.minX + bounds.maxX) / 2 + shift;
  const cz = (bounds.minZ + bounds.maxZ) / 2;
  const width = bounds.maxX - bounds.minX;
  const depth = bounds.maxZ - bounds.minZ;
  const span = Math.max(width, depth * 1.15);
  let back = Math.max(18, span * 1.02);
  let height = Math.max(12, span * 0.56);
  if (width > 28) {
    back *= 1.28;
    height *= 1.22;
  }
  return {
    target: new THREE.Vector3(cx, 0.45, cz),
    position: new THREE.Vector3(cx, height, cz + back),
  };
}

function FollowCamera({ robot, focusTick = 0, cameraMode = 'follow', spatialFloor = '1F' }) {
  const { camera, controls } = useThree();
  const snapped = useRef(null);
  const goal = useRef(null);
  const slideFrom = useRef(null);
  const slide = useRef(1);
  useFrame((_, delta) => {
    if (!controls) return;
    if (camera.up.y !== 1) camera.up.set(0, 1, 0);
    if (cameraMode === 'plan') {
      if (snapped.current !== 'plan') {
        snapped.current = 'plan';
        controls.target.set(0, 0, 0);
        camera.position.set(0, 68, 20);
        camera.lookAt(0, 0, 0);
        controls.update();
      }
      return;
    }
    if (cameraMode === 'spatial') {
      const key = `spatial:${spatialFloor}`;
      if (snapped.current !== key) {
        snapped.current = key;
        goal.current = spatialFrame(spatialFloor);
        slideFrom.current = {
          target: controls.target.clone(),
          position: camera.position.clone(),
        };
        slide.current = 0;
      }
      const frame = goal.current;
      if (frame && slide.current < 1) {
        slide.current = Math.min(1, slide.current + Math.min(delta, 0.05) / 0.42);
        const ease = 1 - (1 - slide.current) ** 3;
        controls.target.lerpVectors(slideFrom.current.target, frame.target, ease);
        camera.position.lerpVectors(slideFrom.current.position, frame.position, ease);
      } else if (frame) {
        controls.target.copy(frame.target);
      }
      return;
    }
    if (!robot) return;
    const focus = focusPoint(robot);
    const snapKey = `${robot.id}:${focusTick}`;
    if (snapped.current !== snapKey) {
      snapped.current = snapKey;
      controls.target.copy(focus);
      camera.position.set(focus.x, focus.y + 11, focus.z + 12);
      return;
    }
    const followDelta = focus.clone().sub(controls.target);
    controls.target.add(followDelta);
    camera.position.add(followDelta);
  }, -1);
  return null;
}

function Zone({ node, onClick, selectedDestination }) {
  const forbidden = node.forbidden;
  const color = selectedDestination ? '#7dffe7' : forbidden ? '#ff8a6a' : '#26e4d0';
  const radius = node.radius || 0.72;
  return (
    <group
      position={[node.x + shiftOf(node.floor), 0.05, node.z]}
      onClick={onClick ? (event) => {
        event.stopPropagation();
        onClick(event);
      } : undefined}
    >
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]}>
        <circleGeometry args={[radius, 40]} />
        <meshBasicMaterial color={color} transparent opacity={selectedDestination ? 0.25 : 0.12} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <ringGeometry args={[radius - 0.08, radius - 0.035, 40]} />
        <meshBasicMaterial color={color} transparent opacity={selectedDestination ? 1 : 0.75} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
        <ringGeometry args={[radius + 0.08, radius + 0.11, 40]} />
        <meshBasicMaterial color={color} transparent opacity={selectedDestination ? 0.85 : 0.42} />
      </mesh>
      <mesh position={[0, 0.055, 0]}>
        <cylinderGeometry args={[0.025, 0.035, 0.11, 12]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} />
      </mesh>
      <Text position={[0, 0.08, radius + 0.42]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.4} color="#042656" anchorX="center" anchorY="middle" outlineWidth={0.026} outlineColor="#ffffff">
        {node.label}
      </Text>
      {onClick && (
        <mesh position={[0, 0.7, 0]}>
          <cylinderGeometry args={[radius + 0.2, radius + 0.2, 1.4, 20]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

function LidarSweep({ robot }) {
  const count = 24;
  const ranges = [0.55, 0.95, 1.35];
  const color = robot.nearestDist < 1.1 ? '#ffb56a' : robot.color;
  const arcs = useMemo(() => ranges.map((radius) =>
    Array.from({ length: count + 1 }, (_, index) => {
      const angle = -Math.PI / 2 + (Math.PI * index) / count;
      return [Math.sin(angle) * radius, 0.04, -Math.cos(angle) * radius];
    }),
  ), []);

  return (
    <group position={[0, 0.3, 0]}>
      <mesh position={[0, 0, -0.16]}>
        <sphereGeometry args={[0.055, 12, 12]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {arcs.map((points, index) => (
        <Line
          key={ranges[index]}
          points={points}
          color={color}
          transparent
          opacity={robot.nearestDist < 1.1 ? 0.95 : 0.62 - index * 0.12}
          lineWidth={index === 0 ? 2 : 1.5}
        />
      ))}
    </group>
  );
}

function Robot({ robot, selected, onSelect, showLidar }) {
  const focus = focusPoint(robot);
  const riding = Boolean(robot.elevator);
  const fade = riding ? 0.38 : 1;
  const body = (color, extra = {}) => (
    <meshStandardMaterial
      color={color}
      transparent={riding}
      opacity={fade}
      depthWrite={!riding}
      {...extra}
    />
  );
  return (
    <group
      position={[focus.x, 0.02, focus.z]}
      rotation={[0, robot.heading || 0, 0]}
      onClick={(e) => {
        if (!onSelect) return;
        e.stopPropagation();
        onSelect(robot.id);
      }}
    >
      <mesh position={[0, 0.12, 0]} castShadow>
        <cylinderGeometry args={[0.34, 0.38, 0.18, 24]} />
        {body(robot.color, { emissive: robot.color, emissiveIntensity: riding ? 0.15 : selected ? 1.3 : robot.avoiding ? 0.9 : 0.45 })}
      </mesh>
      <mesh position={[0, 0.39, 0]} castShadow>
        <boxGeometry args={[0.48, 0.42, 0.42]} />
        {body('#d8e7f2', { metalness: 0.45, roughness: 0.28 })}
      </mesh>
      <mesh position={[0, 0.62, -0.06]}>
        <boxGeometry args={[0.28, 0.06, 0.24]} />
        {body('#162b40')}
      </mesh>
      {[-0.23, 0.23].map((x) =>
        [-0.22, 0.22].map((z) => (
          <mesh key={`${x}:${z}`} position={[x, 0.06, z]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.09, 0.09, 0.07, 16]} />
            {body('#070d14')}
          </mesh>
        )),
      )}
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[ROBOT_RADIUS - 0.04, ROBOT_RADIUS, 40]} />
        <meshBasicMaterial color={robot.avoiding ? '#ffc46d' : '#ffffff'} transparent opacity={riding ? 0.28 : 0.95} />
      </mesh>
      {showLidar && !riding && <LidarSweep robot={robot} />}
      <Text position={[0, 1.02, 0]} fontSize={0.22} color={robot.color} anchorX="center" outlineWidth={0.025} outlineColor="#07111e" fillOpacity={fade}>
        {robot.id}
      </Text>
      {robot.passenger && (
        <Html position={[0, 1.85, 0]} center distanceFactor={12} zIndexRange={[30, 0]} style={{ pointerEvents: 'none', opacity: fade }}>
          <div className="passenger-card">
            <p><em>고객</em><b>{[robot.passenger.name, robot.passenger.age ? `${robot.passenger.age}세` : ''].filter(Boolean).join(' / ') || '—'}</b></p>
            <p><em>장애</em><b>{[robot.passenger.severity, robot.passenger.grade].filter(Boolean).join(' ') || '—'}</b></p>
            <p><em>역무원</em><b>{robot.passenger.staff || '—'}</b></p>
          </div>
        </Html>
      )}
      {selected && (
        <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.78, 0.82, 40]} />
          <meshBasicMaterial color="#ffffff" transparent={riding} opacity={fade} />
        </mesh>
      )}
    </group>
  );
}

function Person({ person }) {
  const moving = Math.hypot(person.vx || 0, person.vz || 0) > 0.05;
  return (
    <group position={[person.x + shiftOf(person.floor || '1F'), 0.08, person.z]}>
      {moving && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 0]}>
          <circleGeometry args={[0.22, 12]} />
          <meshBasicMaterial color="#d4aa72" transparent opacity={0.22} />
        </mesh>
      )}
      <mesh position={[0, 0.26, 0]}>
        <capsuleGeometry args={[0.09, 0.28, 4, 8]} />
        <meshStandardMaterial color={person.hue ? '#d8b59a' : '#89a8cb'} />
      </mesh>
      <mesh position={[0, 0.49, 0]}>
        <sphereGeometry args={[0.085, 12, 12]} />
        <meshStandardMaterial color="#e7c7a9" />
      </mesh>
    </group>
  );
}

function RouteLine({ robot, floor, route = robot.route, color = robot.color, dashed = false }) {
  const points = useMemo(() => {
    const pts = (route || [])
      .map((id) => nodes.find((n) => n.id === id))
      .filter((node) => node && node.floor === floor)
      .map((n) => new THREE.Vector3(n.x + shiftOf(floor), 0.08, n.z));
    return pts.length < 2 ? null : pts;
  }, [route, floor]);
  if (!points) return null;
  return <Line points={points} color={color} transparent opacity={0.9} lineWidth={2} dashed={dashed} dashSize={0.35} gapSize={0.2} />;
}

function Scene({
  robots, pedestrians, extras, selected, onSelect, missionDraft,
  onMapPoint, plannedPath, layers, selectionFloor, focusTick, cameraMode = 'follow', spatialFloor = '1F',
}) {
  const active = robots.find((robot) => robot.id === selected);
  const levels = ['1F', 'B1'];
  const drawPath = (path, floor, color, arrows = false) => {
    const points = (path || [])
      .filter((point) => point.floor === floor)
      .map((point) => new THREE.Vector3(point.x + shiftOf(floor), 0.08, point.z));
    if (points.length < 2) return null;
    const marks = [];
    if (arrows) {
      let pending = 1.6;
      const spacing = 2.6;
      for (let index = 1; index < points.length; index += 1) {
        const from = points[index - 1];
        const to = points[index];
        const length = from.distanceTo(to);
        if (length < 0.35) continue;
        let distance = pending;
        while (distance < length - 0.25) {
          const position = from.clone().lerp(to, distance / length);
          position.y = 0.12;
          const direction = to.clone().sub(from).normalize();
          marks.push({
            key: `${index}-${Math.round(distance * 10)}`,
            position,
            quaternion: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction),
          });
          distance += spacing;
        }
        pending = distance - length;
      }
    }
    return (
      <group>
        <Line points={points} color={color} transparent opacity={0.95} lineWidth={3} />
        {marks.map((mark) => (
          <mesh key={mark.key} position={mark.position} quaternion={mark.quaternion}>
            <coneGeometry args={[0.09, 0.22, 4]} />
            <meshBasicMaterial color={color} />
          </mesh>
        ))}
      </group>
    );
  };
  const selectFloorPoint = (event) => {
    if (!missionDraft?.selecting || !onMapPoint) return;
    event.stopPropagation();
    const floor = selectionFloor || '1F';
    onMapPoint({ x: event.point.x, z: event.point.z, floor });
  };
  return (
    <>
      <color attach="background" args={['#07111e']} />
      <fog attach="fog" args={['#07111e', 220, 420]} />
      <ambientLight intensity={1.35} />
      <hemisphereLight args={['#fff6ea', '#8ea0b4', 0.85]} />
      <directionalLight position={[12, 22, 8]} intensity={1.7} castShadow />
      {levels.map((level) => {
        const shift = shiftOf(level);
        const startPoint = missionDraft?.start || active?.originPoint;
        const destinationPoint = missionDraft?.destination || active?.targetPoint;
        const visibleDraftPath = missionDraft?.destination ? plannedPath : [];
        const livePath = !missionDraft && active?.missionPath?.length > 1 ? active.missionPath : null;
        const liveIndex = livePath ? Math.min(active.missionPathIndex || 0, livePath.length - 1) : 0;
        const here = active ? { x: active.x, z: active.z, floor: active.floor } : null;
        const traveledPath = livePath && here ? [...livePath.slice(0, liveIndex), here] : [];
        const upcomingPath = livePath && here ? [here, ...livePath.slice(liveIndex)] : [];
        return (
          <group key={level}>
            <StationShell
              floor={level}
              selectable={Boolean(onMapPoint) && missionDraft?.selecting && selectionFloor === level}
              onSelectPoint={selectFloorPoint}
            />
            <AmenityMeshes floor={level} />
            <ElevatorCars floor={level} />
            <Text position={[shift, 0.2, Math.min(...footprintRings(level).flat().map((point) => point[1])) - 1.35]} fontSize={0.55} color="#d6e8ff" anchorX="center" outlineWidth={0.03} outlineColor="#07111e">
              {FLOOR_TITLE[level]}
            </Text>
            {pillars.filter((pillar) => (pillar.floor || '1F') === level).map((pillar) => (
              <mesh key={pillar.id} position={[pillar.x + shift, 0.82, pillar.z]} castShadow>
                <cylinderGeometry args={[pillar.r, pillar.r * 1.08, 1.64, 20]} />
                <meshStandardMaterial color="#f4f1ea" roughness={0.62} />
              </mesh>
            ))}
            {stationAreas.filter((area) => area.floor === level && area.kind !== 'track').map((area) => (
              <Text key={area.id} position={[area.x + shift, 0.08, area.z]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.5} color="#042656" anchorX="center" anchorY="middle" outlineWidth={0.03} outlineColor="#ffffff">
                {area.label}
              </Text>
            ))}
            {nodes.filter((node) => node.floor === level && !node.service).map((node) => (
              <Zone
                key={node.id}
                node={node}
                selectedDestination={destinationPoint?.floor === level
                  && Math.hypot(destinationPoint.x - node.x, destinationPoint.z - node.z) <= (node.radius || 0.7)}
              />
            ))}
            {layers.geofence && geofences.filter((fence) => (fence.floor || '1F') === level).map((fence) => (
              <group key={fence.id} position={[fence.x + shift, 0.05, fence.z]}>
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                  <circleGeometry args={[fence.r + ROBOT_RADIUS, 28]} />
                  <meshBasicMaterial color="#ff6f4a" transparent opacity={0.16} />
                </mesh>
                <Text position={[0, 0.55, 0]} fontSize={0.2} color="#ffb199" anchorX="center">{fence.label}</Text>
              </group>
            ))}
            {(extras || []).filter((extra) => (extra.floor || '1F') === level).map((extra) => (
              <mesh key={extra.id} position={[extra.x + shift, 0.22, extra.z]} castShadow>
                {extra.kind === 'cone' ? <coneGeometry args={[extra.r, 0.44, 12]} /> : <boxGeometry args={[extra.r * 1.5, 0.32, extra.r * 1.1]} />}
                <meshStandardMaterial color={extra.kind === 'cone' ? '#ff8a3d' : '#c4a574'} />
              </mesh>
            ))}
            {layers.crowd && pedestrians.filter((person) => (person.floor || '1F') === level).map((person) => <Person key={person.id} person={person} />)}
            {layers.path && robots.filter((robot) => robot.floor === level && !robot.missionPath && robot.route?.length > 1).map((robot) => (
              <RouteLine key={`path${robot.id}`} robot={robot} floor={level} />
            ))}
            {layers.path && missionDraft?.destination && drawPath(visibleDraftPath, level, '#ff9a3c', true)}
            {layers.path && drawPath(traveledPath, level, '#3dce74')}
            {layers.path && drawPath(upcomingPath, level, '#ff9a3c', true)}
            {[['START', startPoint, '#44e0cf'], ['DESTINATION', destinationPoint, '#ffc46d']].map(([label, point, color]) => (
              point?.floor === level && (
                <group key={label} position={[point.x + shift, 0.06, point.z]}>
                  <mesh rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.48, 0.58, 40]} />
                    <meshBasicMaterial color={color} />
                  </mesh>
                  <Text position={[0, 0.48, 0]} fontSize={0.23} color={color} anchorX="center" outlineWidth={0.03} outlineColor="#07111e">{label}</Text>
                </group>
              )
            ))}
          </group>
        );
      })}
      {robots.map((robot) => (
        <Robot
          key={robot.id}
          robot={robot}
          selected={selected === robot.id}
          onSelect={missionDraft?.selecting ? undefined : onSelect}
          showLidar={layers.lidar}
        />
      ))}
      <FollowCamera robot={active} focusTick={focusTick} cameraMode={cameraMode} spatialFloor={spatialFloor} />
      <OrbitControls
        makeDefault
        target={cameraMode === 'follow' ? [-36, 0.35, 0.2] : [-8, 0, 0]}
        minDistance={cameraMode === 'follow' ? 4 : 16}
        maxDistance={cameraMode === 'plan' ? 180 : cameraMode === 'spatial' ? 120 : 26}
        maxPolarAngle={cameraMode === 'plan' ? 0.45 : cameraMode === 'spatial' ? 1.28 : 1.15}
        minPolarAngle={cameraMode === 'plan' ? 0.18 : cameraMode === 'spatial' ? 0.42 : 0.28}
        enableRotate={cameraMode !== 'plan'}
        enablePan
        screenSpacePanning
        mouseButtons={{
          LEFT: cameraMode === 'plan' ? THREE.MOUSE.PAN : THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: cameraMode === 'plan' ? THREE.MOUSE.PAN : THREE.MOUSE.ROTATE,
        }}
      />
    </>
  );
}

export default function StationScene(props) {
  return (
    <Canvas
      camera={{ position: [-8, 118, 42], fov: 42 }}
      dpr={[1, 1.25]}
      gl={{ antialias: false, powerPreference: 'high-performance', localClippingEnabled: true }}
    >
      <Scene {...props} />
    </Canvas>
  );
}
