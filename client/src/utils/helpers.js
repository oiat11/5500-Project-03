// 格式化货币
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return "N/A";
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(amount);
};

// 格式化日期
export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return format(new Date(dateString), "PPP");
};

// 根据背景色计算文本颜色
export const getContrastColor = (hexColor) => {
  if (!hexColor) return '#000000';
  
  hexColor = hexColor.replace('#', '');
  
  const r = parseInt(hexColor.substr(0, 2), 16);
  const g = parseInt(hexColor.substr(2, 2), 16);
  const b = parseInt(hexColor.substr(4, 2), 16);
  
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  
  return yiq >= 128 ? '#000000' : '#ffffff';
}; 