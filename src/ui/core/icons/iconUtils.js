export function getAvailableIconIds(iconMap) {
  return Object.keys(iconMap).sort();
}

export function isIconIdExists(id, iconMap) {
  return Object.prototype.hasOwnProperty.call(iconMap, id);
}

export function printAvailableIcons(iconMap) {
  console.log('📦 Available icon ids:');
  console.log(getAvailableIconIds(iconMap));
}
