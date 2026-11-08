import React, { useId } from 'react';
import { AMENITY_STYLE, ROBOT_RADIUS, amenities, elevatorCars, floorDetails, footprintRings, geofences, pillars, stationAreas, trackBeds } from '../simulation.js';

const PAD = 36;

function contentBounds(floor) {
  const points = [
    ...footprintRings(floor).flat(),
    ...(trackBeds[floor] || []).flat(),
  ];
  if (!points.length) return { minX: -11.4, maxX: 11.4, minZ: -6.7, maxZ: 6.7 };
  return {
    minX: Math.min(...points.map((point) => point[0])) - 1.4,
    maxX: Math.max(...points.map((point) => point[0])) + 1.4,
    minZ: Math.min(...points.map((point) => point[1])) - 1.4,
    maxZ: Math.max(...points.map((point) => point[1])) + 1.4,
  };
}

function polygonPath(points, project) {
  return points.map(([x, z]) => project(x, z).slice(0, 2).join(',')).join(' ');
}

function makeProjector(bounds) {
  const width = 760 - PAD * 2;
  const height = 520 - PAD * 2;
  return (x, z) => {
    const spanX = bounds.maxX - bounds.minX || 1;
    const spanZ = bounds.maxZ - bounds.minZ || 1;
    const scale = Math.min(width / spanX, height / spanZ);
    const originX = PAD + (width - spanX * scale) / 2;
    const originY = PAD + (height - spanZ * scale) / 2;
    return [originX + (x - bounds.minX) * scale, originY + (z - bounds.minZ) * scale, scale];
  };
}

function worldRect(area, project) {
  const [x1, y1] = project(area.x - area.w / 2, area.z - area.d / 2);
  const [x2, y2] = project(area.x + area.w / 2, area.z + area.d / 2);
  return {
    x: Math.min(x1, x2),
    y: Math.min(y1, y2),
    width: Math.abs(x2 - x1),
    height: Math.abs(y2 - y1),
  };
}

function routeArrows(run, project, spacing = 46) {
  const points = run.map((point) => project(point.x, point.z).slice(0, 2));
  const arrows = [];
  let pending = spacing * 0.75;
  for (let index = 1; index < points.length; index += 1) {
    const [x1, y1] = points[index - 1];
    const [x2, y2] = points[index];
    const length = Math.hypot(x2 - x1, y2 - y1);
    if (length < 1) continue;
    const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
    let distance = pending;
    while (distance < length) {
      const t = distance / length;
      arrows.push({
        x: x1 + (x2 - x1) * t,
        y: y1 + (y2 - y1) * t,
        angle,
      });
      distance += spacing;
    }
    pending = distance - length;
  }
  return arrows;
}

function runsOnFloor(path, floor) {
  const runs = [];
  let current = [];
  (path || []).forEach((point) => {
    if (point.floor === floor) {
      current.push(point);
      return;
    }
    if (current.length) runs.push(current);
    current = [];
  });
  if (current.length) runs.push(current);
  return runs.filter((run) => run.length > 1);
}

export default function FloorPlan({
  floor,
  spots,
  start,
  destination,
  path,
  robots,
  extras,
  onSpot,
}) {
  const markerId = useId().replace(/:/g, '');
  const project = makeProjector(contentBounds(floor));
  const areas = stationAreas.filter((area) => area.floor === floor && area.kind !== 'track');
  const rings = footprintRings(floor);
  const beds = trackBeds[floor] || [];
  const queues = floorDetails[floor]?.queues || [];
  const floorAmenities = amenities.filter((item) => item.floor === floor);
  const floorPillars = pillars.filter((pillar) => (pillar.floor || '1F') === floor);
  const floorFences = geofences.filter((fence) => (fence.floor || '1F') === floor);
  const floorExtras = (extras || []).filter((extra) => (extra.floor || '1F') === floor);
  const floorRobots = (robots || []).filter((robot) => (
    robot.elevator ? robot.elevator.fromFloor === floor : robot.floor === floor
  ));
  const routeRuns = runsOnFloor(path, floor);

  return (
    <svg className="floorplan" viewBox="0 0 760 520" role="img" aria-label={`${floor} 2D 경로 지도`}>
      <defs>
        <pattern id={`${markerId}-tile`} width="26" height="26" patternUnits="userSpaceOnUse">
          <rect width="26" height="26" fill="#e7edf4" />
          <rect x="1.5" y="1.5" width="23" height="23" fill="none" stroke="rgba(126, 146, 168, 0.45)" />
        </pattern>
      </defs>
      <rect width="760" height="520" rx="16" fill="#10243f" style={{ pointerEvents: 'none' }} />
      {rings.map((ring, index) => (
        <polygon key={`deck-${index}`} points={polygonPath(ring, project)} fill={`url(#${markerId}-tile)`} stroke="#8ea4bd" strokeWidth="3" style={{ pointerEvents: 'none' }} />
      ))}
      {queues.map((line, index) => {
        const rect = worldRect(line, project);
        return <rect key={`queue-${index}`} {...rect} fill="#7eb6e8" opacity="0.85" style={{ pointerEvents: 'none' }} />;
      })}
      {elevatorCars.filter((car) => !car.floors || car.floors.includes(floor)).map((car) => {
        const rect = worldRect(car, project);
        return (
          <g key={car.id} style={{ pointerEvents: 'none' }}>
            <rect {...rect} rx="3" fill="#0054A6" />
            <text x={rect.x + rect.width / 2} y={rect.y + rect.height / 2 + 4} textAnchor="middle" fill="#ffffff" stroke="#042656" strokeWidth="3" paintOrder="stroke" fontSize="14" fontWeight="800">{car.label}</text>
          </g>
        );
      })}
      {beds.map((bed, index) => (
        <polygon key={`bed-${index}`} points={polygonPath(bed, project)} fill="#2a313b" stroke="#6d7784" strokeWidth="1.5" style={{ pointerEvents: 'none' }} />
      ))}
      {areas.map((area) => {
        const [x, y] = project(area.x, area.z);
        return (
          <text key={area.id} x={x} y={y} textAnchor="middle" fill="#042656" stroke="#ffffff" strokeWidth="4" paintOrder="stroke" fontSize="16" fontWeight="800" style={{ pointerEvents: 'none' }}>
            {area.label}
          </text>
        );
      })}
      {floorAmenities.map((item) => {
        const rect = worldRect(item, project);
        const style = AMENITY_STYLE[item.kind];
        return (
          <g key={item.id} style={{ pointerEvents: 'none' }}>
            <rect
              {...rect}
              rx={item.kind === 'seat' ? 2 : 8}
              fill={style.color}
              stroke="#10243f"
              strokeWidth="1.5"
            />
            {(item.label ?? style.label) ? (
              <text x={rect.x + rect.width / 2} y={rect.y + rect.height / 2 + 4} textAnchor="middle" fill="#ffffff" stroke="#07111e" strokeWidth="4" paintOrder="stroke" fontSize="15" fontWeight="800">
                {item.label ?? style.label}
              </text>
            ) : null}
          </g>
        );
      })}
      {floorPillars.map((pillar) => {
        const [x, y, scale] = project(pillar.x, pillar.z);
        const radius = Math.max(5, (pillar.r + ROBOT_RADIUS) * scale);
        return <circle key={pillar.id} cx={x} cy={y} r={radius} fill="#08182E" opacity="0.9" />;
      })}
      {floorFences.map((fence) => {
        const [x, y, scale] = project(fence.x, fence.z);
        const radius = Math.max(12, (fence.r + ROBOT_RADIUS) * scale);
        return (
          <g key={fence.id}>
            <circle cx={x} cy={y} r={radius} fill="rgba(227, 46, 74, 0.18)" stroke="#FF8A9A" strokeDasharray="4 3" />
            <text x={x} y={y + 4} textAnchor="middle" fill="#FFD0D6" fontSize="10">{fence.label}</text>
          </g>
        );
      })}
      {routeRuns.map((run, index) => {
        const points = run.map((point) => project(point.x, point.z).slice(0, 2).join(',')).join(' ');
        return (
          <g key={`route-${index}`} style={{ pointerEvents: 'none' }}>
            <polyline points={points} fill="none" stroke="#ff9a3c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.95" />
            {routeArrows(run, project, 64).map((arrow, arrowIndex) => (
              <path
                key={`arrow-${arrowIndex}`}
                d="M-4.5,-2.8 L5.5,0 L-4.5,2.8 Z"
                fill="#ff9a3c"
                transform={`translate(${arrow.x} ${arrow.y}) rotate(${arrow.angle})`}
              />
            ))}
          </g>
        );
      })}
      {floorExtras.map((extra) => {
        const [x, y] = project(extra.x, extra.z);
        return <rect key={extra.id} x={x - 7} y={y - 7} width="14" height="14" rx="3" fill="#F0B45A" style={{ pointerEvents: 'none' }} />;
      })}
      {floorRobots.map((robot) => {
        const [x, y, scale] = project(robot.x, robot.z);
        const footprint = Math.max(7, ROBOT_RADIUS * scale);
        const faded = Boolean(robot.elevator);
        return (
          <g key={robot.id} style={{ pointerEvents: 'none' }} opacity={faded ? 0.38 : 1}>
            <circle cx={x} cy={y} r={footprint} fill="none" stroke="#FFFFFF" strokeDasharray="3 2" />
            <circle cx={x} cy={y} r={Math.max(4, footprint * 0.45)} fill="#FFFFFF" stroke="#0054A6" strokeWidth="2" />
            <text x={x} y={y - footprint - 4} textAnchor="middle" fill="#FFFFFF" fontSize="10">{robot.id}</text>
          </g>
        );
      })}
      {spots.filter((spot) => spot.floor === floor).map((spot) => {
        const [x, y] = project(spot.x, spot.z);
        const isStart = start?.id === spot.id;
        const isDestination = destination?.id === spot.id;
        const label = spot.label.replace(/^B[12]\s/, '');
        return (
          <g key={spot.id}>
            <g
              className="floorplan-spot"
              onClick={() => onSpot(spot)}
              role="button"
              tabIndex={0}
              aria-label={isStart ? `출발역 ${spot.label}` : spot.label}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSpot(spot);
                }
              }}
            >
              <circle cx={x} cy={y} r="18" fill={isStart ? '#0054A6' : isDestination ? '#F5C451' : '#F4F8FF'} stroke={isStart || isDestination ? '#FFFFFF' : '#7EB6FF'} strokeWidth="2" />
              <text x={x} y={y + 4} textAnchor="middle" fill={isDestination ? '#0B2E5B' : isStart ? '#FFFFFF' : '#0B3F86'} fontSize="11" fontWeight="700" style={{ pointerEvents: 'none' }}>
                {isStart ? '출' : isDestination ? '도' : '●'}
              </text>
            </g>
            <text x={x} y={y + 34} textAnchor="middle" fill="#042656" stroke="#ffffff" strokeWidth="3.5" paintOrder="stroke" fontSize="14" fontWeight="800" style={{ pointerEvents: 'none' }}>{label}</text>
          </g>
        );
      })}
    </svg>
  );
}
