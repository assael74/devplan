// 📁 /b_styleObjects/icons/iconUtils.js

export function getAvailableIconIds(iconMap) {
  return Object.keys(iconMap).sort();
}

export function isIconIdExists(id, iconMap) {
  return iconMap.hasOwnProperty(id);
}

export function printAvailableIcons(iconMap) {
  console.log('📦 Available icon ids:');
  console.log(getAvailableIconIds(iconMap));
}
