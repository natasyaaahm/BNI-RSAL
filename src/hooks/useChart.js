import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

Chart.register(...registerables);
Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
Chart.defaults.font.size = 12;
Chart.defaults.color = "#94a3b8";
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.legend.labels.padding = 16;

/**
 * @param {React.RefObject} canvasRef
 * @param {string} type
 * @param {object|null} data
 * @param {object} options
 * @param {React.MutableRefObject<number>} readyCountRef - shared counter ref,
 *   incremented each time a chart finishes its first animation
 */
export default function useChart(canvasRef, type, data, options = {}, readyCountRef = null) {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !data) return;
    if (chartRef.current) chartRef.current.destroy();

    // Inject onComplete callback to track when chart finishes rendering
    const patchedOptions = {
      ...options,
      animation: {
        ...(options.animation || {}),
        onComplete() {
          if (readyCountRef) readyCountRef.current += 1;
        },
      },
    };

    chartRef.current = new Chart(canvasRef.current, {
      type,
      data,
      options: patchedOptions,
    });

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);
}
