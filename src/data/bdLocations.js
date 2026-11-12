import { districts, upazillas, unions } from 'bd-geojs';

const generateLocations = () => {
  const locationMap = {};

  districts.forEach((dist) => {
    const distName = dist.bn_name || dist.name;
    locationMap[distName] = {};

    const distUpazilas = upazillas.filter((u) => String(u.district_id) === String(dist.id));

    distUpazilas.forEach((upz) => {
      const upzName = upz.bn_name || upz.name;

      const upzUnions = unions
        .filter((un) => String(un.upazilla_id) === String(upz.id))
        .map((un) => un.bn_name || un.name);

      locationMap[distName][upzName] =
        upzUnions.length > 0 ? upzUnions : [`${upzName} সদর / পৌরসভা`];
    });
  });

  return locationMap;
};

export const BD_LOCATIONS = generateLocations();
