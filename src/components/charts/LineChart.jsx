import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const LineChart = ({ data, title, height = 300 }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#374151",
          font: {
            family: "inherit",
            size: 12,
          },
          usePointStyle: true,
          pointStyle: "line",
        },
      },
      title: {
        display: !!title,
        text: title,
        color: "#374151",
        font: {
          family: "inherit",
          size: 16,
          weight: "bold",
        },
      },
      tooltip: {
        backgroundColor: "#1f2937",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "#374151",
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function (context) {
            const formatter = new Intl.NumberFormat("es-PE", {
              style: "currency",
              currency: "PEN",
              minimumFractionDigits: 0,
            });
            return `${context.dataset.label}: ${formatter.format(context.raw)}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#6b7280",
          font: {
            family: "inherit",
            size: 11,
          },
        },
        grid: {
          color: "#e5e7eb",
          borderColor: "#d1d5db",
        },
      },
      y: {
        ticks: {
          color: "#6b7280",
          font: {
            family: "inherit",
            size: 11,
          },
          callback: function (value) {
            const formatter = new Intl.NumberFormat("es-PE", {
              style: "currency",
              currency: "PEN",
              minimumFractionDigits: 0,
              notation: "compact",
            });
            return formatter.format(value);
          },
        },
        grid: {
          color: "#e5e7eb",
          borderColor: "#d1d5db",
        },
      },
    },
  };

  return (
    <div style={{ height }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default LineChart;
