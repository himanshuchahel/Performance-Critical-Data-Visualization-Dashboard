import React from "react";

export interface CanvasRendererProps {
  type:
    | "line"
    | "smooth-line"
    | "area"
    | "bar"
    | "scatter"
    | "heatmap"
    | "histogram";

  data: number[][];
  columns?: string[];
  xColumn?: string;
  yColumn?: string;
  xLabels?: string[];

  width?: number;
  height?: number;

  showGrid?: boolean;
  animate?: boolean;

  onPerformanceUpdate?: (metrics: {
  fps: number;
  frameTime: number;
  renderTime: number;
}) => void;
}

interface HoverPoint {
  index: number;
  x: number;
  y: number;
  valueX: number;
  valueY: number;
  label?: string;
}

interface ChartPoint {
  x: number;
  y: number;
  valueX: number;
  valueY: number;
  index: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function getPointValues(point: number[], index: number) {
  if (!point || point.length === 0) {
    return {
      x: index,
      y: 0,
    };
  }

  if (point.length === 1) {
    return {
      x: index,
      y: Number(point[0]) || 0,
    };
  }

  return {
    x: Number(point[0]) || 0,
    y: Number(point[1]) || 0,
  };
}

function getBounds(data: number[][]) {
  if (!data.length) {
    return {
      minX: 0,
      maxX: 1,
      minY: 0,
      maxY: 1,
    };
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  data.forEach((point, index) => {
    const { x, y } = getPointValues(point, index);

    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  });

  if (!Number.isFinite(minX)) minX = 0;
  if (!Number.isFinite(maxX)) maxX = 1;
  if (!Number.isFinite(minY)) minY = 0;
  if (!Number.isFinite(maxY)) maxY = 1;

  if (minX === maxX) {
    minX -= 1;
    maxX += 1;
  }

  if (minY === maxY) {
    minY -= 1;
    maxY += 1;
  }

  return {
    minX,
    maxX,
    minY,
    maxY,
  };
}

function downsampleData(
  data: number[][],
  maxPoints: number
) {
  if (data.length <= maxPoints) {
    return data;
  }

  const result: number[][] = [];
  const step =
    (data.length - 1) /
    Math.max(1, maxPoints - 1);

  for (let i = 0; i < maxPoints; i++) {
    const index = Math.round(i * step);

    if (data[index]) {
      result.push(data[index]);
    }
  }

  return result;
}

function formatValue(value: number) {
  if (!Number.isFinite(value)) return "0";

  if (Math.abs(value) >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }

  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }

  if (Number.isInteger(value)) {
    return value.toString();
  }

  return value.toFixed(2);
}

export function CanvasRenderer({
  type,
  data,
  columns = [],
  xColumn,
  yColumn,
  xLabels = [],
  width = 600,
  height = 500,
  showGrid = true,
  animate = false,
  onPerformanceUpdate,
}: CanvasRendererProps) {
  const containerRef =
    React.useRef<HTMLDivElement>(null);

  const canvasRef =
    React.useRef<HTMLCanvasElement>(null);

  const [zoom, setZoom] = React.useState(1);

  const [offsetX, setOffsetX] =
    React.useState(0);

  const [offsetY, setOffsetY] =
    React.useState(0);

  const [hoverPoint, setHoverPoint] =
    React.useState<HoverPoint | null>(null);

  const typeRef = React.useRef(type);
  const dataRef = React.useRef(data);
  const columnsRef = React.useRef(columns);
  const xLabelsRef = React.useRef(xLabels);

  const zoomRef = React.useRef(zoom);
  const offsetXRef = React.useRef(offsetX);
  const offsetYRef = React.useRef(offsetY);

  const showGridRef =
    React.useRef(showGrid);

  const animateRef =
    React.useRef(animate);

  const onPerformanceUpdateRef =
    React.useRef(onPerformanceUpdate);

  const sizeRef = React.useRef({
    width,
    height,
  });

  const pointerRef = React.useRef({
    x: 0,
    y: 0,
    active: false,
  });

  const draggingRef =
    React.useRef(false);

  const dragStartRef = React.useRef({
    x: 0,
    y: 0,
  });

  const initialOffsetRef =
    React.useRef({
      x: 0,
      y: 0,
    });

  const hoverIndexRef =
    React.useRef<number | null>(null);

  const animationStartRef =
    React.useRef(performance.now());

  const fpsFramesRef =
    React.useRef(0);

  const fpsStartRef =
    React.useRef<number | null>(null);

  const renderTimeTotalRef =
    React.useRef(0);

  const renderTimeFramesRef =
    React.useRef(0);

  typeRef.current = type;
  dataRef.current = data;
  columnsRef.current = columns;
  xLabelsRef.current = xLabels;

  zoomRef.current = zoom;
  offsetXRef.current = offsetX;
  offsetYRef.current = offsetY;

  showGridRef.current = showGrid;
  animateRef.current = animate;
  onPerformanceUpdateRef.current =
    onPerformanceUpdate;

  const resolvedXColumn =
    xColumn ??
    columns[0] ??
    "X";

  const resolvedYColumn =
    yColumn ??
    columns[1] ??
    "Y";

  const xColumnRef =
    React.useRef(resolvedXColumn);

  const yColumnRef =
    React.useRef(resolvedYColumn);

  xColumnRef.current =
    resolvedXColumn;

  yColumnRef.current =
    resolvedYColumn;

  React.useEffect(() => {
    animationStartRef.current =
      performance.now();

    fpsFramesRef.current = 0;
    fpsStartRef.current = null;
    renderTimeTotalRef.current = 0;
    renderTimeFramesRef.current = 0;
  }, [data, type]);

  React.useEffect(() => {
    const container =
      containerRef.current;

    const canvas =
      canvasRef.current;

    if (!container || !canvas) {
      return;
    }

    const resizeCanvas = () => {
      const rect =
        container.getBoundingClientRect();

      const cssWidth = Math.max(
        320,
        Math.floor(rect.width)
      );

      const cssHeight =
        Math.max(360, height);

      const dpr =
        window.devicePixelRatio || 1;

      canvas.width =
        Math.floor(cssWidth * dpr);

      canvas.height =
        Math.floor(cssHeight * dpr);

      canvas.style.width = "100%";
      canvas.style.height =
        `${cssHeight}px`;

      sizeRef.current = {
        width: cssWidth,
        height: cssHeight,
      };

      const ctx =
        canvas.getContext("2d");

      if (!ctx) return;

      ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
      );
    };

    resizeCanvas();

    const observer =
      new ResizeObserver(resizeCanvas);

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [height, width]);

  React.useEffect(() => {
    const canvas =
      canvasRef.current;

    if (!canvas) return;

    const ctx =
      canvas.getContext("2d");

    if (!ctx) return;

    let animationFrame = 0;
    let running = true;

    const draw = (timestamp: number) => {
      if (!running) return;

      const currentType =
        typeRef.current;

      const currentData =
        dataRef.current;

      const currentWidth =
        sizeRef.current.width;

      const currentHeight =
        sizeRef.current.height;

      const currentZoom =
        zoomRef.current;

      const currentOffsetX =
        offsetXRef.current;

      const currentOffsetY =
        offsetYRef.current;

      const currentShowGrid =
        showGridRef.current;

      const currentAnimate =
        animateRef.current;

      const currentLabels =
        xLabelsRef.current;

      const dpr =
        window.devicePixelRatio || 1;

      fpsFramesRef.current++;

      if (fpsStartRef.current === null) {
        fpsStartRef.current =
          timestamp;
      }

      const renderStart =
        performance.now();

      ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
      );

      ctx.clearRect(
        0,
        0,
        currentWidth,
        currentHeight
      );

      ctx.fillStyle =
        "#0a0f1c";

      ctx.fillRect(
        0,
        0,
        currentWidth,
        currentHeight
      );

      const padding = {
        left: 70,
        right: 25,
        top: 30,
        bottom: 65,
      };

      const chartWidth =
        currentWidth -
        padding.left -
        padding.right;

      const chartHeight =
        currentHeight -
        padding.top -
        padding.bottom;

      if (
        chartWidth <= 0 ||
        chartHeight <= 0
      ) {
        animationFrame =
          requestAnimationFrame(draw);

        return;
      }

      const renderData =
        downsampleData(
          currentData,
          5000
        );

      const bounds =
        getBounds(renderData);

      let {
        minX,
        maxX,
        minY,
        maxY,
      } = bounds;

      if (currentType === "bar") {
        minY = Math.min(0, minY);
        maxY = Math.max(0, maxY);

        if (minY === maxY) {
          minY = -1;
          maxY = 1;
        }
      }

      if (currentType === "histogram") {
        minX = 0;
        maxX = 20;
        minY = 0;
        maxY = Math.max(
          1,
          ...renderData.map(
            (point, index) =>
              getPointValues(
                point,
                index
              ).y
          )
        );
      }

      const xRange =
        Math.max(
          0.000001,
          maxX - minX
        );

      const yRange =
        Math.max(
          0.000001,
          maxY - minY
        );

      const zoomedXRange =
        xRange /
        Math.max(
          0.1,
          currentZoom
        );

      const zoomedYRange =
        yRange /
        Math.max(
          0.1,
          currentZoom
        );

      const centerX =
        (minX + maxX) / 2;

      const centerY =
        (minY + maxY) / 2;

      const visibleMinX =
        centerX -
        zoomedXRange / 2 -
        currentOffsetX;

      const visibleMaxX =
        centerX +
        zoomedXRange / 2 -
        currentOffsetX;

      const visibleMinY =
        centerY -
        zoomedYRange / 2 +
        currentOffsetY;

      const visibleMaxY =
        centerY +
        zoomedYRange / 2 +
        currentOffsetY;

      const toCanvasX =
        (value: number) => {
          const normalized =
            (value -
              visibleMinX) /
            Math.max(
              0.000001,
              visibleMaxX -
                visibleMinX
            );

          return (
            padding.left +
            normalized *
              chartWidth
          );
        };

      const toCanvasY =
        (value: number) => {
          const normalized =
            (value -
              visibleMinY) /
            Math.max(
              0.000001,
              visibleMaxY -
                visibleMinY
            );

          return (
            padding.top +
            chartHeight -
            normalized *
              chartHeight
          );
        };

      let progress = 1;

      if (currentAnimate) {
        progress = clamp(
          (timestamp -
            animationStartRef.current) /
            700,
          0,
          1
        );
      }

      if (currentShowGrid) {
        ctx.save();

        ctx.strokeStyle =
          "rgba(148,163,184,0.12)";

        ctx.lineWidth = 1;

        for (
          let i = 0;
          i <= 5;
          i++
        ) {
          const ratio = i / 5;

          const y =
            padding.top +
            ratio *
              chartHeight;

          ctx.beginPath();

          ctx.moveTo(
            padding.left,
            y
          );

          ctx.lineTo(
            padding.left +
              chartWidth,
            y
          );

          ctx.stroke();
        }

        for (
          let i = 0;
          i <= 5;
          i++
        ) {
          const ratio = i / 5;

          const x =
            padding.left +
            ratio *
              chartWidth;

          ctx.beginPath();

          ctx.moveTo(
            x,
            padding.top
          );

          ctx.lineTo(
            x,
            padding.top +
              chartHeight
          );

          ctx.stroke();
        }

        ctx.restore();
      }

      ctx.save();

      ctx.strokeStyle =
        "rgba(148,163,184,0.45)";

      ctx.lineWidth = 1;

      ctx.beginPath();

      ctx.moveTo(
        padding.left,
        padding.top
      );

      ctx.lineTo(
        padding.left,
        padding.top +
          chartHeight
      );

      ctx.lineTo(
        padding.left +
          chartWidth,
        padding.top +
          chartHeight
      );

      ctx.stroke();

      ctx.restore();

      ctx.save();

      ctx.fillStyle =
        "rgba(226,232,240,0.7)";

      ctx.font =
        "11px Inter, system-ui, sans-serif";

      ctx.textAlign = "center";

      const useCategoryLabels =
        currentLabels.length > 0 &&
        (
          currentType === "bar" ||
          currentType === "line" ||
          currentType === "smooth-line" ||
          currentType === "area"
        );

      if (useCategoryLabels) {
        const labelCount =
          Math.min(
            7,
            currentLabels.length
          );

        const step =
          Math.max(
            1,
            Math.floor(
              (currentLabels.length - 1) /
                Math.max(
                  1,
                  labelCount - 1
                )
            )
          );

        for (
          let i = 0;
          i < currentLabels.length;
          i += step
        ) {
          const ratio =
            currentLabels.length === 1
              ? 0.5
              : i /
                (currentLabels.length - 1);

          const x =
            padding.left +
            ratio *
              chartWidth;

          let label =
            String(
              currentLabels[i] ?? ""
            );

          if (label.length > 14) {
            label =
              `${label.slice(0, 12)}…`;
          }

          ctx.save();

          ctx.translate(
            x,
            currentHeight - 34
          );

          ctx.rotate(
            currentLabels.length >
              5
              ? -0.35
              : 0
          );

          ctx.fillText(
            label,
            0,
            0
          );

          ctx.restore();
        }
      } else {
        for (
          let i = 0;
          i <= 5;
          i++
        ) {
          const ratio = i / 5;

          const x =
            padding.left +
            ratio *
              chartWidth;

          const value =
            lerp(
              visibleMinX,
              visibleMaxX,
              ratio
            );

          ctx.fillText(
            formatValue(value),
            x,
            currentHeight - 35
          );
        }
      }

      ctx.textAlign = "right";

      for (
        let i = 0;
        i <= 5;
        i++
      ) {
        const ratio = i / 5;

        const y =
          padding.top +
          chartHeight -
          ratio *
            chartHeight;

        const value =
          lerp(
            visibleMinY,
            visibleMaxY,
            ratio
          );

        ctx.fillText(
          formatValue(value),
          padding.left - 10,
          y + 4
        );
      }

      ctx.restore();

      ctx.save();

      ctx.fillStyle =
        "rgba(241,245,249,0.9)";

      ctx.font =
        "bold 12px Inter, system-ui, sans-serif";

      ctx.textAlign = "center";

      ctx.fillText(
        xColumnRef.current,
        padding.left +
          chartWidth / 2,
        currentHeight - 10
      );

      ctx.save();

      ctx.translate(
        15,
        padding.top +
          chartHeight / 2
      );

      ctx.rotate(-Math.PI / 2);

      ctx.fillText(
        yColumnRef.current,
        0,
        0
      );

      ctx.restore();

      ctx.restore();

      const points: ChartPoint[] =
        renderData.map(
          (point, index) => {
            const values =
              getPointValues(
                point,
                index
              );

            return {
              x: toCanvasX(values.x),
              y: toCanvasY(values.y),
              valueX: values.x,
              valueY: values.y,
              index,
            };
          }
        );

      ctx.save();

      ctx.beginPath();

      ctx.rect(
        padding.left,
        padding.top,
        chartWidth,
        chartHeight
      );

      ctx.clip();

      if (
        currentType === "line" ||
        currentType === "smooth-line" ||
        currentType === "area"
      ) {
        if (points.length > 0) {
          const animatedPoints =
            points.map(
              (point) => ({
                ...point,
                y: toCanvasY(
                  lerp(
                    minY,
                    point.valueY,
                    progress
                  )
                ),
              })
            );

          if (
            currentType === "area"
          ) {
            const first =
              animatedPoints[0];

            const last =
              animatedPoints[
                animatedPoints.length - 1
              ];

            ctx.beginPath();

            ctx.moveTo(
              first.x,
              padding.top +
                chartHeight
            );

            animatedPoints.forEach(
              (point) => {
                ctx.lineTo(
                  point.x,
                  point.y
                );
              }
            );

            ctx.lineTo(
              last.x,
              padding.top +
                chartHeight
            );

            ctx.closePath();

            const gradient =
              ctx.createLinearGradient(
                0,
                padding.top,
                0,
                padding.top +
                  chartHeight
              );

            gradient.addColorStop(
              0,
              "rgba(96,165,250,0.30)"
            );

            gradient.addColorStop(
              1,
              "rgba(96,165,250,0.02)"
            );

            ctx.fillStyle =
              gradient;

            ctx.fill();
          }

          ctx.beginPath();

          if (
            currentType ===
            "smooth-line"
          ) {
            const first =
              animatedPoints[0];

            ctx.moveTo(
              first.x,
              first.y
            );

            for (
              let i = 1;
              i <
              animatedPoints.length;
              i++
            ) {
              const previous =
                animatedPoints[
                  i - 1
                ];

              const current =
                animatedPoints[i];

              const midX =
                (previous.x +
                  current.x) /
                2;

              const midY =
                (previous.y +
                  current.y) /
                2;

              ctx.quadraticCurveTo(
                previous.x,
                previous.y,
                midX,
                midY
              );
            }

            const last =
              animatedPoints[
                animatedPoints.length - 1
              ];

            ctx.lineTo(
              last.x,
              last.y
            );
          } else {
            animatedPoints.forEach(
              (point, index) => {
                if (index === 0) {
                  ctx.moveTo(
                    point.x,
                    point.y
                  );
                } else {
                  ctx.lineTo(
                    point.x,
                    point.y
                  );
                }
              }
            );
          }

          ctx.strokeStyle =
            "#60a5fa";

          ctx.lineWidth = 2.5;

          ctx.lineJoin = "round";
          ctx.lineCap = "round";

          ctx.stroke();
        }
      } else if (
        currentType === "bar"
      ) {
        const barCount =
          Math.max(
            1,
            points.length
          );

        const slotWidth =
          chartWidth /
          barCount;

        const zeroY =
          toCanvasY(0);

        points.forEach(
          (point, index) => {
            const animatedValue =
              lerp(
                0,
                point.valueY,
                progress
              );

            const valueY =
              toCanvasY(
                animatedValue
              );

            const x =
              padding.left +
              index *
                slotWidth +
              2;

            const y =
              Math.min(
                zeroY,
                valueY
              );

            const barHeight =
              Math.max(
                1,
                Math.abs(
                  valueY -
                    zeroY
                )
              );

            const barWidth =
              Math.max(
                1,
                slotWidth - 4
              );

            ctx.fillStyle =
              "#34d399";

            ctx.fillRect(
              x,
              y,
              barWidth,
              barHeight
            );

            if (
              points.length <= 30 &&
              barWidth >= 18
            ) {
              ctx.fillStyle =
                "rgba(241,245,249,0.8)";

              ctx.font =
                "10px Inter, system-ui, sans-serif";

              ctx.textAlign =
                "center";

              ctx.fillText(
                formatValue(
                  point.valueY
                ),
                x +
                  barWidth / 2,
                y - 5
              );
            }
          }
        );
      } else if (
        currentType === "scatter"
      ) {
        points.forEach(
          (point) => {
            const animatedY =
              toCanvasY(
                lerp(
                  minY,
                  point.valueY,
                  progress
                )
              );

            ctx.beginPath();

            ctx.arc(
              point.x,
              animatedY,
              4,
              0,
              Math.PI * 2
            );

            ctx.fillStyle =
              "#f472b6";

            ctx.fill();
          }
        );
      } else if (
        currentType === "heatmap"
      ) {
        const cells =
          Math.min(
            100,
            renderData.length
          );

        const columnsCount =
          Math.min(
            10,
            Math.max(
              1,
              Math.ceil(
                Math.sqrt(cells)
              )
            )
          );

        const rowsCount =
          Math.ceil(
            cells /
              columnsCount
          );

        const cellWidth =
          chartWidth /
          columnsCount;

        const cellHeight =
          chartHeight /
          Math.max(
            1,
            rowsCount
          );

        renderData
          .slice(0, cells)
          .forEach(
            (point, index) => {
              const row =
                Math.floor(
                  index /
                    columnsCount
                );

              const column =
                index %
                columnsCount;

              const values =
                getPointValues(
                  point,
                  index
                );

              const normalized =
                clamp(
                  (values.y -
                    minY) /
                    Math.max(
                      0.000001,
                      maxY -
                        minY
                    ),
                  0,
                  1
                );

              const alpha =
                0.15 +
                normalized * 0.8;

              ctx.fillStyle =
                `rgba(96,165,250,${alpha})`;

              const x =
                padding.left +
                column *
                  cellWidth;

              const y =
                padding.top +
                row *
                  cellHeight;

              ctx.fillRect(
                x + 1,
                y + 1,
                Math.max(
                  1,
                  cellWidth - 2
                ),
                Math.max(
                  1,
                  cellHeight - 2
                )
              );

              if (
                cellWidth >= 45 &&
                cellHeight >= 28
              ) {
                ctx.fillStyle =
                  "rgba(255,255,255,0.85)";

                ctx.font =
                  "10px Inter, system-ui, sans-serif";

                ctx.textAlign =
                  "center";

                ctx.fillText(
                  formatValue(
                    values.y
                  ),
                  x +
                    cellWidth / 2,
                  y +
                    cellHeight / 2 +
                    3
                );
              }
            }
          );
      } else if (
        currentType === "histogram"
      ) {
        const values =
          renderData.map(
            (point, index) =>
              getPointValues(
                point,
                index
              ).y
          );

        if (values.length > 0) {
          const bins = 20;

          const histogram =
            new Array(bins).fill(0);

          const valueMin =
            Math.min(...values);

          const valueMax =
            Math.max(...values);

          const range =
            valueMax -
              valueMin ||
            1;

          values.forEach(
            (value) => {
              const binIndex =
                clamp(
                  Math.floor(
                    ((value -
                      valueMin) /
                      range) *
                      bins
                  ),
                  0,
                  bins - 1
                );

              histogram[
                binIndex
              ]++;
            }
          );

          const maxCount =
            Math.max(
              1,
              ...histogram
            );

          const barWidth =
            chartWidth /
            bins;

          histogram.forEach(
            (count, index) => {
              const barHeight =
                (count /
                  maxCount) *
                chartHeight *
                progress;

              ctx.fillStyle =
                "#a78bfa";

              ctx.fillRect(
                padding.left +
                  index *
                    barWidth +
                  2,
                padding.top +
                  chartHeight -
                  barHeight,
                Math.max(
                  1,
                  barWidth - 4
                ),
                barHeight
              );

              if (
                barWidth >= 28 &&
                count > 0
              ) {
                ctx.fillStyle =
                  "rgba(255,255,255,0.8)";

                ctx.font =
                  "9px Inter, system-ui, sans-serif";

                ctx.textAlign =
                  "center";

                ctx.fillText(
                  String(count),
                  padding.left +
                    index *
                      barWidth +
                    barWidth / 2,
                  padding.top +
                    chartHeight -
                    barHeight -
                    4
                );
              }
            }
          );
        }
      }

      ctx.restore();

      const renderTime =
        performance.now() - renderStart;

      renderTimeTotalRef.current +=
        renderTime;

      renderTimeFramesRef.current++;

      if (
        fpsStartRef.current !== null &&
        timestamp - fpsStartRef.current >= 500
      ) {
        const elapsed =
          timestamp - fpsStartRef.current;

        const measuredFps =
          (fpsFramesRef.current * 1000) /
          Math.max(1, elapsed);

        const safeFps =
          clamp(
            measuredFps,
            0,
            240
          );

        const frameTime =
          safeFps > 0
            ? 1000 / safeFps
            : 0;

        const averageRenderTime =
          renderTimeFramesRef.current > 0
            ? renderTimeTotalRef.current /
              renderTimeFramesRef.current
            : 0;

        onPerformanceUpdateRef.current?.({
          fps:
            Math.round(
              safeFps * 100
            ) / 100,
          frameTime:
            Math.round(
              frameTime * 100
            ) / 100,
          renderTime:
            Math.round(
              averageRenderTime * 100
            ) / 100,
        });

        fpsFramesRef.current = 0;
        fpsStartRef.current =
          timestamp;
        renderTimeTotalRef.current = 0;
        renderTimeFramesRef.current = 0;
      }

      const pointer =
        pointerRef.current;

      if (
        pointer.active &&
        points.length > 0 &&
        (
          currentType === "line" ||
          currentType ===
            "smooth-line" ||
          currentType === "area" ||
          currentType === "scatter"
        )
      ) {
        let nearest:
          ChartPoint | null = null;

        let nearestDistance =
          Infinity;

        for (
          let i = 0;
          i < points.length;
          i++
        ) {
          const point =
            points[i];

          const dx =
            point.x -
            pointer.x;

          const dy =
            point.y -
            pointer.y;

          const distance =
            dx * dx +
            dy * dy;

          if (
            distance <
            nearestDistance
          ) {
            nearestDistance =
              distance;

            nearest = point;
          }
        }

        if (nearest) {
          const distance =
            Math.sqrt(
              nearestDistance
            );

          if (distance <= 25) {
            if (
              hoverIndexRef.current !==
              nearest.index
            ) {
              hoverIndexRef.current =
                nearest.index;

              const labelIndex =
                currentLabels.length > 0
                  ? Math.round(
                      (nearest.index /
                        Math.max(
                          1,
                          points.length - 1
                        )) *
                        Math.max(
                          0,
                          currentLabels.length - 1
                        )
                    )
                  : -1;

              const nextHover: HoverPoint = {
                index:
                  nearest.index,
                x: nearest.x,
                y: nearest.y,
                valueX:
                  nearest.valueX,
                valueY:
                  nearest.valueY,
                label:
                  labelIndex >= 0
                    ? currentLabels[
                        labelIndex
                      ]
                    : undefined,
              };

              setHoverPoint(
                nextHover
              );
            }
          } else {
            if (
              hoverIndexRef.current !==
              null
            ) {
              hoverIndexRef.current =
                null;

              setHoverPoint(
                null
              );
            }
          }
        }
      }

      animationFrame =
        requestAnimationFrame(draw);
    };

    animationFrame =
      requestAnimationFrame(draw);

    return () => {
      running = false;

      cancelAnimationFrame(
        animationFrame
      );
    };
  }, []);

  const handlePointerMove =
    React.useCallback(
      (
        event: React.PointerEvent<HTMLCanvasElement>
      ) => {
        const canvas =
          canvasRef.current;

        if (!canvas) return;

        const rect =
          canvas.getBoundingClientRect();

        const x =
          event.clientX -
          rect.left;

        const y =
          event.clientY -
          rect.top;

        pointerRef.current = {
          x,
          y,
          active: true,
        };

        if (
          draggingRef.current
        ) {
          const dx =
            x -
            dragStartRef.current.x;

          const dy =
            y -
            dragStartRef.current.y;

          const newOffsetX =
            initialOffsetRef.current.x -
            dx /
              Math.max(
                1,
                100 *
                  zoomRef.current
              );

          const newOffsetY =
            initialOffsetRef.current.y +
            dy /
              Math.max(
                1,
                100 *
                  zoomRef.current
              );

          offsetXRef.current =
            newOffsetX;

          offsetYRef.current =
            newOffsetY;

          setOffsetX(
            newOffsetX
          );

          setOffsetY(
            newOffsetY
          );
        }
      },
      []
    );

  const handlePointerLeave =
    React.useCallback(() => {
      pointerRef.current.active =
        false;

      hoverIndexRef.current =
        null;

      setHoverPoint(null);

      draggingRef.current =
        false;
    }, []);

  const handlePointerDown =
    React.useCallback(
      (
        event: React.PointerEvent<HTMLCanvasElement>
      ) => {
        const canvas =
          canvasRef.current;

        if (!canvas) return;

        const rect =
          canvas.getBoundingClientRect();

        const x =
          event.clientX -
          rect.left;

        const y =
          event.clientY -
          rect.top;

        draggingRef.current =
          true;

        dragStartRef.current = {
          x,
          y,
        };

        initialOffsetRef.current = {
          x: offsetXRef.current,
          y: offsetYRef.current,
        };

        canvas.setPointerCapture(
          event.pointerId
        );
      },
      []
    );

  const handlePointerUp =
    React.useCallback(
      (
        event: React.PointerEvent<HTMLCanvasElement>
      ) => {
        draggingRef.current =
          false;

        const canvas =
          canvasRef.current;

        if (
          canvas?.hasPointerCapture(
            event.pointerId
          )
        ) {
          canvas.releasePointerCapture(
            event.pointerId
          );
        }
      },
      []
    );

  const handleWheel =
    React.useCallback(
      (
        event: React.WheelEvent<HTMLCanvasElement>
      ) => {
        event.preventDefault();

        const factor =
          event.deltaY > 0
            ? 1 / 1.15
            : 1.15;

        const newZoom =
          clamp(
            zoomRef.current *
              factor,
            0.5,
            20
          );

        zoomRef.current =
          newZoom;

        setZoom(newZoom);
      },
      []
    );

  const resetView =
    React.useCallback(() => {
      zoomRef.current = 1;
      offsetXRef.current = 0;
      offsetYRef.current = 0;

      setZoom(1);
      setOffsetX(0);
      setOffsetY(0);
    }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full"
    >
      <canvas
        ref={canvasRef}
        aria-label={`${type} chart`}
        className="block w-full touch-none cursor-crosshair"
        onPointerMove={
          handlePointerMove
        }
        onPointerDown={
          handlePointerDown
        }
        onPointerUp={
          handlePointerUp
        }
        onPointerCancel={
          handlePointerUp
        }
        onPointerLeave={
          handlePointerLeave
        }
        onWheel={handleWheel}
      />

      <div className="absolute right-3 top-3 flex items-center gap-1 rounded-lg border border-border bg-background/90 p-1 shadow-sm backdrop-blur">
        <button
          type="button"
          onClick={() => {
            const newZoom =
              clamp(
                zoomRef.current /
                  1.15,
                0.5,
                20
              );

            zoomRef.current =
              newZoom;

            setZoom(newZoom);
          }}
          className="flex h-7 w-7 items-center justify-center rounded-md text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
          aria-label="Zoom out"
        >
          −
        </button>

        <button
          type="button"
          onClick={resetView}
          className="min-w-12 rounded-md px-1.5 py-1 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          {zoom.toFixed(1)}×
        </button>

        <button
          type="button"
          onClick={() => {
            const newZoom =
              clamp(
                zoomRef.current *
                  1.15,
                0.5,
                20
              );

            zoomRef.current =
              newZoom;

            setZoom(newZoom);
          }}
          className="flex h-7 w-7 items-center justify-center rounded-md text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
          aria-label="Zoom in"
        >
          +
        </button>
      </div>

      {hoverPoint && (
        <div
          className="pointer-events-none absolute z-10 rounded-lg border border-border bg-background/95 px-3 py-2 text-xs shadow-lg backdrop-blur"
          style={{
            left: Math.min(
              hoverPoint.x + 12,
              Math.max(
                10,
                sizeRef.current.width -
                  150
              )
            ),
            top: Math.max(
              8,
              hoverPoint.y - 65
            ),
          }}
        >
          <div className="font-semibold text-foreground">
            Point #{hoverPoint.index + 1}
          </div>

          {hoverPoint.label && (
            <div className="mt-1 text-muted-foreground">
              {resolvedXColumn}:{" "}
              <span className="text-foreground">
                {hoverPoint.label}
              </span>
            </div>
          )}

          <div className="text-muted-foreground">
            {resolvedXColumn}:{" "}
            <span className="text-foreground">
              {hoverPoint.valueX.toFixed(
                2
              )}
            </span>
          </div>

          <div className="text-muted-foreground">
            {resolvedYColumn}:{" "}
            <span className="text-foreground">
              {hoverPoint.valueY.toFixed(
                2
              )}
            </span>
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute bottom-2 left-3 text-[10px] text-muted-foreground/60">
        Scroll to zoom · Drag to pan
      </div>
    </div>
  );
}