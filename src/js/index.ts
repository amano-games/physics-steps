import JSON5 from "json5";

import P5, { File } from "p5";
import type { Element } from "p5";
import { colors, opacity, text } from "./theme";

interface Controls {
  view: { x: number; y: number; width: number; height: number; zoom: number };
  viewPos: { prevX: null | number; prevY: null | number; isDragging: boolean };
}

new P5((p5Instance) => {
  const p5 = p5Instance as unknown as P5;

  let steps: Step[] | undefined;

  let staticBodies: Body[] | undefined;
  let stepsWithCollisions: number[] | undefined;

  let slider: Element | undefined;
  let wrapper: Element | undefined;
  let buttonNext: Element | undefined;
  let buttonPrev: Element | undefined;
  let buttonNextCol: Element | undefined;
  let buttonPrevCol: Element | undefined;

  const controls: Controls = {
    view: { x: 0, y: 0, width: 0, height: 0, zoom: 1 },
    viewPos: { prevX: null, prevY: null, isDragging: false },
  };

  function v2(arr: [number, number]) {
    const [x, y] = arr;
    return p5.createVector(x, y);
  }

  function toColor(arr: number[], a: number = opacity.m) {
    const [r, g, b] = arr;
    return p5.color(r, g, b, a * 255);
  }

  function nextStep() {
    if (slider == null || steps == null) return;
    const current = Number(slider.value());
    slider.value(Math.min(current + 1, steps.length - 1));
  }

  function prevStep() {
    if (slider == null) return;
    const current = Number(slider.value());
    slider.value(Math.max(current - 1, 0));
  }

  function findNextCollision() {
    if (!slider) return;
    const current = Number(slider.value());
    const index = stepsWithCollisions?.find((item) => item > current);
    return index;
  }

  function findPrevCollision() {
    if (!slider) return;
    const current = Number(slider.value());
    const index = stepsWithCollisions?.findLast((item) => item < current);
    return index;
  }

  function createControls() {
    if (slider != null) slider.remove();
    if (buttonNext != null) buttonNext.remove();
    if (buttonNextCol != null) buttonNextCol.remove();
    if (buttonPrev != null) buttonPrev.remove();
    if (buttonPrevCol != null) buttonPrevCol.remove();

    if (steps == null) return;

    wrapper = p5.createDiv();
    wrapper.addClass("wrapper");
    wrapper.position(0, 0);

    buttonPrevCol = p5.createButton("<<");
    buttonPrevCol.parent(wrapper);

    buttonPrev = p5.createButton("<");
    buttonPrev.parent(wrapper);

    slider = p5.createSlider(0, steps.length - 1, 0);
    slider.parent(wrapper);
    const index = findNextCollision()!;
    slider.value(index);

    buttonNext = p5.createButton(">");
    buttonNext.parent(wrapper);

    buttonNextCol = p5.createButton(">>");
    buttonNextCol.parent(wrapper);

    buttonNext.mousePressed(() => {
      nextStep();
    });

    buttonPrev.mousePressed(() => {
      prevStep();
    });

    buttonNextCol.mousePressed(() => {
      const index = findNextCollision()!;
      slider?.value(index);
    });

    buttonPrevCol.mousePressed(() => {
      const index = findPrevCollision()!;
      slider?.value(index);
    });
  }

  function handleFile(file: File) {
    const header = "data:application/x-javascript;base64,";
    let encoded = file.data;
    encoded = encoded.slice(header.length);
    const data = JSON5.parse(atob(encoded));
    steps = data.steps;
    staticBodies = data.static_bodies;

    if (steps == null) return;

    stepsWithCollisions = steps
      .map((item, i) => (item.collisions.length > 0 ? i : null))
      .filter(Boolean) as number[];

    createControls();
  }

  function setup() {
    p5.colorMode(p5.RGB, 255);
    const width = p5.windowWidth;
    const height = p5.windowHeight - 10;
    const c = p5.createCanvas(width, height);

    c.drop(handleFile);

    controls.view.width = width;
    controls.view.height = height;
    controls.view.x = width / 2 - 200;
    controls.view.y = height / 2 - 120;
    controls.view.zoom = 1.5;

    Object.entries(colors).forEach(([key, value]) => {
      console.log(key, value);
      console.log(key, toColor(value));
    });

    p5.strokeWeight(0.5);

    p5.describe("A physics debugger");
  }

  function draw() {
    p5.background(toColor(colors.bg, 1.0));

    p5.translate(controls.view.x, controls.view.y);
    p5.scale(controls.view.zoom);

    drawScreen();

    if (steps) {
      if (p5.keyIsDown(p5.SHIFT)) {
        if (p5.keyIsDown(p5.RIGHT_ARROW)) {
          nextStep();
        }
        if (p5.keyIsDown(p5.LEFT_ARROW)) {
          prevStep();
        }
      }

      const index = Number(slider?.value());
      const step = steps[index];

      drawStep(step);

      const infoHeight = 50;
      const timelineHeight = 20;
      const stepsInfoY = p5.windowHeight - infoHeight;

      drawStepInfo(step, 0, stepsInfoY, p5.windowWidth, infoHeight);
      drawTimeline(
        0,
        stepsInfoY - timelineHeight,
        p5.windowWidth,
        timelineHeight
      );
    } else {
      p5.push();
      p5.fill(toColor(colors.text, opacity.l));
      p5.textSize(text.sizeL);
      p5.textAlign(p5.CENTER, p5.CENTER);
      p5.text("Drop a physics-steps.js to start", 200, 120);
      p5.pop();
    }
  }

  function arrow(x1: number, y1: number, x2: number, y2: number) {
    let start = p5.createVector(x1, y1);
    let end = p5.createVector(x2, y2);

    p5.line(start.x, start.y, end.x, end.y);

    p5.push();

    p5.noStroke();
    p5.circle(end.x, end.y, 1);

    p5.pop();
  }

  function drawScreen() {
    p5.push();
    p5.strokeWeight(2);
    p5.stroke(colors.screenBorder);
    p5.fill(toColor(colors.screen));
    p5.rect(0, 0, 400, 240);
    p5.pop();
  }

  function drawStepInfo(
    step: Step,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    const { name } = step;

    p5.push();
    p5.resetMatrix();

    const padding = 20;

    p5.fill(toColor(colors.infoBg));
    p5.rect(x, y, p5.windowWidth, height);

    p5.fill(toColor(colors.infoFg, opacity.l));
    p5.textSize(text.sizeM);
    p5.textAlign(p5.LEFT, p5.CENTER);
    p5.text(name, x + padding, y + padding);

    if (slider) {
      p5.textAlign(p5.RIGHT, p5.CENTER);
      p5.text(slider?.value(), x + width - padding, y + padding);
    }

    p5.pop();
  }

  function drawTimeline(x: number, y: number, width: number, height: number) {
    const minItems = 300;
    const minItemsH = minItems / 2;

    const current = Number(slider?.value());

    let min = Math.max(0, current - minItemsH);
    let max = Math.min(steps.length, min + minItems);

    let count = max - min;

    if (count < minItems) {
      min = max - minItems;
      count = max - min;
    }

    const paddingX = 2;
    const paddingY = 6;
    const spacing = 1;
    const barHeight = height - paddingY * 2;
    const barWidth = (width - paddingX * 2 - count * spacing) / count;
    const barY = y + paddingY;

    p5.push();
    p5.resetMatrix();

    p5.fill(toColor(colors.timelineBg));
    p5.rect(x, y, width, height);

    for (let index = 0; index < count; index++) {
      const step = steps[index + min];
      p5.noStroke();
      const hasCollision = step.collisions.length > 0;
      const penetration = step.collisions.reduce((prev, curr) => {
        return prev + curr.manifold.depth;
      }, 0);

      if (index + min === current) {
        p5.fill(toColor(colors.aqua));
      } else if (penetration > 6 && penetration < 3) {
        p5.fill(toColor(colors.warm03));
      } else if (penetration > 3) {
        p5.fill(toColor(colors.warm02));
      } else if (hasCollision) {
        p5.fill(toColor(colors.warm01));
      } else {
        p5.fill(toColor(colors.timelineFg));
      }

      const barX = paddingX + index * (barWidth + spacing);

      p5.rect(barX, barY, barWidth, barHeight);
    }

    p5.pop();
  }

  function drawStep(step: Step) {
    p5.push();
    const { ball, cam_offset, collisions } = step;
    p5.translate(cam_offset[0], cam_offset[1]);

    drawStaticBodies(staticBodies);
    drawBall(ball);
    drawCollisions(collisions);

    p5.pop();
  }

  function drawCollisions(collisions: Collision[]) {
    collisions.forEach((item) => {
      p5.push();
      p5.fill(toColor(colors.collider));
      p5.stroke(toColor(colors.collider));
      drawCollisionShape(item.body);
      p5.pop();

      drawCollision(item);
    });
  }

  function drawStaticBodies(bodies: Body[]) {
    if (bodies) {
      bodies.forEach((item) => {
        p5.push();
        p5.fill(toColor(colors.staticBodies, opacity.staticBodies));
        p5.noStroke();
        drawCollisionShape(item);
        p5.pop();
      });
    }
  }

  function drawBallInfo(ball: Body) {
    const pos = v2(ball.pos);
    const { ang_vel: angVel, ang_vel_d: angVelDel } = ball;
    const vel = v2(ball.vel).mult(10).add(pos);
    const velDelta = v2(ball.vel_d).mult(10).add(pos);
    const shape = ball.shape as ShapeCircle;
    const r = shape.r;

    p5.push();

    p5.textSize(text.sizeS);
    p5.textAlign(p5.LEFT, p5.CENTER);
    p5.text(
      `pos: ${pos.x}, ${pos.y}
vel: ${vel.x}, ${vel.y}
velDelta: ${velDelta.x}, ${velDelta.y}
velAng: ${angVel}
velAngDelta: ${angVelDel}
`,
      pos.x + r + 10,
      pos.y - r
    );

    p5.pop();
  }

  function drawBallGhost(ball: Body) {
    const pos = v2(ball.pos);
    const posN = v2(ball.vel).add(pos);
    const shape = ball.shape as ShapeCircle;
    const r = shape.r;

    p5.circle(posN.x, posN.y, r * 2);
    p5.circle(posN.x, posN.y, 1);
  }

  function drawBallVel(ball: Body) {
    const pos = v2(ball.pos);
    const vel = v2(ball.vel).mult(10).add(pos);
    arrow(pos.x, pos.y, vel.x, vel.y);
  }

  function drawBallVelDelta(ball: Body) {
    const pos = v2(ball.pos);
    const velDelta = v2(ball.vel_d).mult(10).add(pos);

    if (velDelta.x + velDelta.y != 0) {
      arrow(pos.x, pos.y, velDelta.x, velDelta.y);
    }
  }

  function drawBallShape(ball: Body) {
    const pos = v2(ball.pos);
    const shape = ball.shape as ShapeCircle;
    const r = shape.r;

    // Draw Ball
    p5.circle(pos.x, pos.y, r * 2);
    p5.circle(pos.x, pos.y, 1);
  }

  function drawBall(ball: Body) {
    p5.push();
    p5.fill(toColor(colors.info, opacity.l));
    p5.textSize(text.sizeS);
    drawBallInfo(ball);
    p5.pop();

    p5.push();
    p5.stroke(toColor(colors.ghost, opacity.s));
    p5.fill(toColor(colors.ghost, opacity.s));
    drawBallGhost(ball);
    p5.pop();

    p5.push();
    p5.stroke(toColor(colors.ball));
    p5.fill(toColor(colors.ball));
    drawBallShape(ball);

    p5.push();
    p5.stroke(toColor(colors.velocity, opacity.l));
    p5.fill(toColor(colors.velocity, opacity.l));
    drawBallVel(ball);
    p5.pop();

    p5.push();
    p5.stroke(toColor(colors.angular, opacity.l));
    p5.fill(toColor(colors.angular, opacity.l));
    drawBallVelDelta(ball);
    p5.pop();

    p5.pop();
  }

  function drawCollisionStart(collision: Collision) {
    const { manifold, body } = collision;
    const a = v2(manifold.contact);

    p5.circle(a.x, a.y, 1);
  }

  function drawCollisionEnd(collision: Collision) {
    const { manifold } = collision;
    const { depth } = manifold;
    const a = v2(manifold.contact);
    const b = v2(manifold.normal).normalize().mult(depth).add(a);

    p5.circle(b.x, b.y, 1);
  }

  function drawCollisionDepth(collision: Collision) {
    const { manifold } = collision;
    const { depth } = manifold;

    const a = v2(manifold.contact);
    const b = v2(manifold.normal).normalize().mult(depth).add(a);

    p5.line(a.x, a.y, b.x, b.y);
  }

  function drawCollisionInfo(collision: Collision) {
    const { manifold, body } = collision;
    const { depth } = manifold;
    const a = v2(manifold.contact);
    const vel = v2(body.vel);

    p5.text(
      `depth: ${depth}
vel: ${vel.x}, ${vel.y}
`,
      a.x - 20,
      a.y
    );
  }

  function drawCollision(collision: Collision) {
    p5.push();
    p5.fill(toColor(colors.contact01));
    p5.noStroke();
    drawCollisionStart(collision);
    p5.pop();

    p5.push();
    p5.fill(toColor(colors.contact02));
    p5.noStroke();
    drawCollisionEnd(collision);
    p5.pop();

    p5.push();
    p5.fill(toColor(colors.black));
    p5.stroke(toColor(colors.black));
    drawCollisionDepth(collision);
    p5.pop();

    p5.push();
    p5.textAlign(p5.RIGHT, p5.CENTER);
    p5.textSize(text.sizeS);
    p5.fill(toColor(colors.info, opacity.l));
    drawCollisionInfo(collision);
    p5.pop();
  }

  function drawCollisionShape(body: Body) {
    const { shape_type: shapeType } = body;
    switch (shapeType.id) {
      case 0:
        {
          const shape = body.shape as ShapeCircle;
          const p = v2(shape.p).add(v2(body.pos));
          p5.circle(p.x, p.y, shape.r * 2);
        }
        break;
      case 2:
        {
          const shape = body.shape as ShapePolygon;
          p5.beginShape();
          for (let i = 0; i < shape.verts.length; i++) {
            const a = v2(shape.verts[i]);
            p5.vertex(a.x, a.y);
          }
          p5.endShape(p5.CLOSE);
        }
        break;
      case 3:
        {
          const shape = body.shape as ShapeCapsule;
          const a = v2(shape.a);
          const b = v2(shape.b);
          const { ra, rb } = shape;

          p5.circle(a.x, a.y, ra * 2);
          p5.circle(b.x, b.y, rb * 2);

          p5.line(a.x, a.y, b.x, b.y);

          const theta = Math.atan2(b.y - a.y, b.x - a.x);
          const rot = {
            c: Math.cos(theta),
            s: Math.sin(theta),
          };

          const tan_1_a = { x: a.x + ra * rot.c, y: a.y - ra * rot.s };
          const tan_1_b = { x: b.x + rb * rot.c, y: b.y - rb * rot.s };

          const tan_2_a = { x: a.x - ra * rot.c, y: a.y + ra * rot.s };
          const tan_2_b = { x: b.x - rb * rot.c, y: b.y + rb * rot.s };

          p5.line(tan_1_a.x, tan_1_a.y, tan_1_b.x, tan_1_b.y);
          p5.line(tan_2_a.x, tan_2_a.y, tan_2_b.x, tan_2_b.y);
        }
        break;
      default:
        console.warn("Shape type not handled", shapeType);
        break;
    }
  }

  function keyPressed() {
    const { keyCode } = p5;
    if (keyCode === p5.LEFT_ARROW) {
      prevStep();
    } else if (keyCode === p5.RIGHT_ARROW) {
      nextStep();
    }
  }

  function mouseWheel(event: MouseEvent) {
    const { width, height } = controls.view;
    const { x, y } = event;
    const deltaY = event["deltaY"];
    const direction = deltaY > 0 ? -1 : 1;

    const factor = 0.8;
    const zoom = 1 * direction * factor;
    const newZoom = controls.view.zoom + zoom;

    if (newZoom < 0.01) return;

    const wx = (x - controls.view.x) / (width * controls.view.zoom);
    const wy = (y - controls.view.y) / (height * controls.view.zoom);

    controls.view.x -= wx * width * zoom;
    controls.view.y -= wy * height * zoom;
    controls.view.zoom = newZoom;
  }

  function mousePressed(e: MouseEvent) {
    const { target } = e;
    const nodeName = target["nodeName"];
    if (nodeName !== "CANVAS") return;
    controls.viewPos.isDragging = true;
    controls.viewPos.prevX = e.clientX;
    controls.viewPos.prevY = e.clientY;
  }

  function mouseReleased(e: MouseEvent) {
    const { target } = e;
    const nodeName = target["nodeName"];
    if (nodeName !== "CANVAS") return;
    controls.viewPos.isDragging = false;
    controls.viewPos.prevX = null;
    controls.viewPos.prevY = null;
  }

  function mouseDragged(e: MouseEvent) {
    const { isDragging } = controls.viewPos;

    const prevX = controls.viewPos.prevX;
    const prevY = controls.viewPos.prevY;

    if (!isDragging) return;

    const pos = { x: e.clientX, y: e.clientY };

    let dx = 0;
    let dy = 0;

    if (prevX != null) {
      dx = pos.x - prevX;
    }

    if (prevY != null) {
      dy = pos.y - prevY;
    }

    if (prevX || prevY) {
      controls.view.x += dx;
      controls.view.y += dy;

      controls.viewPos.prevX = pos.x;
      controls.viewPos.prevY = pos.y;
    }
  }

  p5.setup = setup;
  p5.draw = draw;
  p5.keyPressed = keyPressed;
  p5.mouseWheel = mouseWheel;
  p5.mouseDragged = mouseDragged;
  p5.mousePressed = mousePressed;
  p5.mouseReleased = mouseReleased;
}, document.getElementById("app")!);