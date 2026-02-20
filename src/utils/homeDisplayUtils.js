/**
 * Returns the homeDisplaySettings key for a given category ID.
 * e.g. 'sofas' -> 'showCategorySofas', 'homecare-hospitalar' -> 'showCategoryHomecareHospitalar'
 */
export function categorySettingKey(id) {
  return 'showCategory' + id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
}
