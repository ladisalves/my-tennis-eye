declare const cv: {
  onRuntimeInitialized?: () => void;
  Mat: new () => any;
  matFromArray: (rows: number, cols: number, type: number, data: number[]) => any;
  getPerspectiveTransform: (src: any, dst: any) => any;
  invert: (src: any, dst: any) => void;
  CV_32FC2: number;
};

type Point = { x: number; y: number };

type Profile = "singles" | "doubles";

type ZonePolygons = {
  inBaseline: Point[];
  inSideline: Point[];
  outBaseline: Point[];
  outSideline: Point[];
};

type CalibrationResult = {
  pixelsPerCm: number;
  baselineCm: number;
  sidelineCm: number;
  lineWidthCm: number;
  homographyInverse: number[];
  zones: ZonePolygons;
};

const LINE_WIDTH_CM = 5.08;
const OUT_ZONE_CM = 30;
const IN_ZONE_CM = 10;
const DOUBLES_ALLEY_CM = 137.16;

const video = document.getElementById("court-video") as HTMLVideoElement;
const canvas = document.getElementById("overlay") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("start-camera") as HTMLButtonElement;
const resetButton = document.getElementById("reset-points") as HTMLButtonElement;
const statusText = document.getElementById("status-text") as HTMLDivElement;
const profileButtons = Array.from(
  document.querySelectorAll<HTMLButtonElement>(".toggle")
);

if (!ctx) {
  throw new Error("Canvas rendering context unavailable");
}

const state = {
  points: [] as Point[],
  isTouching: false,
  touchPoint: null as Point | null,
  profile: "singles" as Profile,
  cvReady: false,
  stream: null as MediaStream | null,
};

const updateStatus = (message?: string) => {
  if (message) {
    statusText.textContent = message;
    return;
  }

  statusText.textContent = `Awaiting calibration points (${state.points.length}/4).`;
};

const waitForOpenCv = () => {
  if (typeof cv === "undefined") {
    setTimeout(waitForOpenCv, 100);
    return;
  }

  if (cv.onRuntimeInitialized) {
    cv.onRuntimeInitialized = () => {
      state.cvReady = true;
      updateStatus();
    };
  } else {
    state.cvReady = true;
  }
};

waitForOpenCv();

const resizeCanvas = () => {
  if (video.videoWidth === 0 || video.videoHeight === 0) {
    return;
  }
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
};

const startCamera = async () => {
  if (state.stream) {
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
      audio: false,
    });

    state.stream = stream;
    video.srcObject = stream;
    await video.play();
    resizeCanvas();
    updateStatus("Tap four points: P1 corner, P2 baseline, P3 sideline, P4 line width.");
  } catch (error) {
    updateStatus("Camera access failed. Check browser permissions.");
    console.error(error);
  }
};

const getCanvasPoint = (event: PointerEvent): Point => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
};

const drawPoint = (point: Point, label: string) => {
  ctx.save();
  ctx.fillStyle = "#f8fafc";
  ctx.strokeStyle = "#111827";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.font = "bold 16px sans-serif";
  ctx.fillStyle = "#f8fafc";
  ctx.fillText(label, point.x + 12, point.y - 12);
  ctx.restore();
};

const drawLoupe = (point: Point) => {
  const radius = 60;
  const zoom = 2.2;
  const srcRadius = radius / zoom;
  const offsetX = Math.min(Math.max(point.x + 80, radius + 10), canvas.width - radius - 10);
  const offsetY = Math.min(Math.max(point.y - 80, radius + 10), canvas.height - radius - 10);

  ctx.save();
  ctx.beginPath();
  ctx.arc(offsetX, offsetY, radius, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(
    video,
    point.x - srcRadius,
    point.y - srcRadius,
    srcRadius * 2,
    srcRadius * 2,
    offsetX - radius,
    offsetY - radius,
    radius * 2,
    radius * 2
  );
  ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
};

const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

const calculateZones = (points: Point[], profile: Profile): CalibrationResult | null => {
  if (points.length < 4) {
    return null;
  }

  const [p1, p2, p3, p4] = points;
  const pixelsPerCm = distance(p1, p4) / LINE_WIDTH_CM;
  if (!Number.isFinite(pixelsPerCm) || pixelsPerCm <= 0) {
    return null;
  }

  const baselineCm = distance(p1, p2) / pixelsPerCm;
  const sidelineCm = distance(p1, p3) / pixelsPerCm;

  const srcMat = cv.matFromArray(4, 1, cv.CV_32FC2, [
    p1.x,
    p1.y,
    p2.x,
    p2.y,
    p3.x,
    p3.y,
    p4.x,
    p4.y,
  ]);
  const dstMat = cv.matFromArray(4, 1, cv.CV_32FC2, [
    0,
    0,
    baselineCm,
    0,
    0,
    sidelineCm,
    LINE_WIDTH_CM,
    LINE_WIDTH_CM,
  ]);

  const homography = cv.getPerspectiveTransform(srcMat, dstMat);
  const homographyInverseMat = new cv.Mat();
  cv.invert(homography, homographyInverseMat);

  const data = (homographyInverseMat.data64F || homographyInverseMat.data32F) as number[];

  srcMat.delete();
  dstMat.delete();
  homography.delete();
  homographyInverseMat.delete();

  const sidelineOffset = profile === "singles" ? DOUBLES_ALLEY_CM : 0;
  const lineX = Math.min(sidelineOffset, baselineCm - LINE_WIDTH_CM);

  const zones: ZonePolygons = {
    inBaseline: [
      { x: 0, y: LINE_WIDTH_CM },
      { x: baselineCm, y: LINE_WIDTH_CM },
      { x: baselineCm, y: LINE_WIDTH_CM + IN_ZONE_CM },
      { x: 0, y: LINE_WIDTH_CM + IN_ZONE_CM },
    ],
    inSideline: [
      { x: lineX + LINE_WIDTH_CM, y: 0 },
      { x: lineX + LINE_WIDTH_CM + IN_ZONE_CM, y: 0 },
      { x: lineX + LINE_WIDTH_CM + IN_ZONE_CM, y: sidelineCm },
      { x: lineX + LINE_WIDTH_CM, y: sidelineCm },
    ],
    outBaseline: [
      { x: 0, y: -OUT_ZONE_CM },
      { x: baselineCm, y: -OUT_ZONE_CM },
      { x: baselineCm, y: 0 },
      { x: 0, y: 0 },
    ],
    outSideline: [
      { x: lineX - OUT_ZONE_CM, y: 0 },
      { x: lineX, y: 0 },
      { x: lineX, y: sidelineCm },
      { x: lineX - OUT_ZONE_CM, y: sidelineCm },
    ],
  };

  return {
    pixelsPerCm,
    baselineCm,
    sidelineCm,
    lineWidthCm: LINE_WIDTH_CM,
    homographyInverse: data,
    zones,
  };
};

const transformPoint = (point: Point, matrix: number[]): Point => {
  const [m0, m1, m2, m3, m4, m5, m6, m7, m8] = matrix;
  const denominator = m6 * point.x + m7 * point.y + m8;
  return {
    x: (m0 * point.x + m1 * point.y + m2) / denominator,
    y: (m3 * point.x + m4 * point.y + m5) / denominator,
  };
};

const drawPolygon = (points: Point[], fill: string) => {
  if (points.length === 0) {
    return;
  }
  ctx.save();
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  points.slice(1).forEach((point) => ctx.lineTo(point.x, point.y));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

const renderZones = (result: CalibrationResult) => {
  const warp = (polygon: Point[]) => polygon.map((point) => transformPoint(point, result.homographyInverse));

  drawPolygon(warp(result.zones.outBaseline), "rgba(239, 68, 68, 0.35)");
  drawPolygon(warp(result.zones.outSideline), "rgba(239, 68, 68, 0.35)");
  drawPolygon(warp(result.zones.inBaseline), "rgba(34, 197, 94, 0.35)");
  drawPolygon(warp(result.zones.inSideline), "rgba(34, 197, 94, 0.35)");
};

const drawLoop = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  state.points.forEach((point, index) => {
    drawPoint(point, `P${index + 1}`);
  });

  if (state.points.length === 4 && state.cvReady) {
    const result = calculateZones(state.points, state.profile);
    if (result) {
      renderZones(result);
    }
  }

  if (state.isTouching && state.touchPoint) {
    drawLoupe(state.touchPoint);
  }

  requestAnimationFrame(drawLoop);
};

canvas.addEventListener("pointerdown", (event) => {
  if (state.points.length >= 4) {
    return;
  }
  state.isTouching = true;
  state.touchPoint = getCanvasPoint(event);
});

canvas.addEventListener("pointermove", (event) => {
  if (!state.isTouching) {
    return;
  }
  state.touchPoint = getCanvasPoint(event);
});

canvas.addEventListener("pointerup", (event) => {
  if (!state.isTouching) {
    return;
  }
  const point = getCanvasPoint(event);
  state.points.push(point);
  state.isTouching = false;
  state.touchPoint = null;
  updateStatus();
});

canvas.addEventListener("pointerleave", () => {
  state.isTouching = false;
  state.touchPoint = null;
});

startButton.addEventListener("click", () => {
  void startCamera();
});

resetButton.addEventListener("click", () => {
  state.points = [];
  updateStatus();
});

profileButtons.forEach((button) => {
  button.addEventListener("click", () => {
    profileButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    state.profile = button.dataset.profile === "doubles" ? "doubles" : "singles";
  });
});

window.addEventListener("resize", resizeCanvas);
video.addEventListener("loadedmetadata", resizeCanvas);

drawLoop();
