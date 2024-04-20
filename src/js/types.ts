interface ShapeCircle {
  p: [number, number];
  r: number;
}

interface ShapeCapsule {
  a: [number, number];
  b: [number, number];
  ra: number;
  rb: number;
}

interface ShapePolygon {
  verts: [number, number][];
}

interface Body {
  shape_type: { id: number; label: string };
  shape: ShapeCircle | ShapeCapsule | ShapePolygon;
  pos: [number, number];
  ang_vel: number;
  ang_vel_d: number;
  vel: [number, number];
  vel_d: [number, number];
}

interface Collision {
  manifold: {
    depth: number;
    contact: [number, number];
    normal: [number, number];
  };
  body: Body;
}

interface Step {
  name: string;
  ball: Body;
  cam_offset: [number, number];
  collisions: Collision[];
}