import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const DoughnutChart = ({ data, title, height = 300 }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          color: "#374151", // Color más legible
          font: {
            family: "inherit",
            size: 12,
          },
          usePointStyle: true,
          pointStyle: "circle",
          padding: 15,
          generateLabels: function (chart) {
            const original = ChartJS.defaults.plugins.legend.labels.generateLabels;
            const labels = original.call(this, chart);

            labels.forEach((label, index) => {
              // Obtener el label original desde los datos
              const originalLabel =
                data.labels && data.labels[index] ? data.labels[index] : "Sin categoría";

              if (data.datasets[0] && data.datasets[0].data[index] !== undefined) {
                const value = data.datasets[0].data[index];
                const total = data.datasets[0].data.reduce((sum, val) => sum + (val || 0), 0);
                if (total > 0 && value > 0) {
                  const percentage = ((value / total) * 100).toFixed(1);
                  label.text = `${originalLabel} (${percentage}%)`;
                } else {
                  label.text = originalLabel;
                }
              } else {
                label.text = originalLabel;
              }
            });

            return labels;
          },
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
            // Obtener el label original desde los datos
            const label =
              data.labels && data.labels[context.dataIndex]
                ? data.labels[context.dataIndex]
                : "Sin categoría";

            const value = context.raw || 0;
            const total = context.dataset.data.reduce((sum, val) => sum + (val || 0), 0);

            if (total > 0 && value > 0) {
              const percentage = ((value / total) * 100).toFixed(1);
              const formatter = new Intl.NumberFormat("es-PE", {
                style: "currency",
                currency: "PEN",
                minimumFractionDigits: 0,
              });
              return `${label}: ${formatter.format(value)} (${percentage}%)`;
            }
            return `${label}: $0 (0%)`;
          },
        },
      },
    },
  };

  return (
    <div style={{ height }}>
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default DoughnutChart;
