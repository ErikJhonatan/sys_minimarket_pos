import React from "react";

const StatCard = ({ title, value, trend, trendValue, icon: Icon, variant = "primary" }) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "primary":
        return "bg-primary text-primary-content";
      case "secondary":
        return "bg-secondary text-secondary-content";
      case "accent":
        return "bg-accent text-accent-content";
      case "info":
        return "bg-info text-info-content";
      case "success":
        return "bg-success text-success-content";
      case "warning":
        return "bg-warning text-warning-content";
      case "error":
        return "bg-error text-error-content";
      default:
        return "bg-base-200 text-base-content";
    }
  };

  const getTrendColor = () => {
    if (!trend || !trendValue) return "";
    return trend === "up" ? "text-success" : "text-error";
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    return trend === "up" ? "↗" : "↘";
  };

  return (
    <div className="stat bg-base-100 shadow-lg rounded-box">
      <div className="stat-figure">
        {Icon && (
          <div className={`p-3 rounded-full ${getVariantClasses()}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      <div className="stat-title text-base-content/70">{title}</div>
      <div className="stat-value text-base-content">{value}</div>
      {trend && trendValue && (
        <div className="stat-desc">
          <span className={getTrendColor()}>
            {getTrendIcon()} {trendValue}%
          </span>
          <span className="text-base-content/60 ml-1">Esta semana</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
