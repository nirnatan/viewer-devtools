import { omit } from 'lodash';
import { isEditor } from './utils';

const parsePetriString = (petriString) => {
  if (!petriString) {
    return {};
  }

  return petriString.split(';').reduce((acc, specString) => {
    const [specName, value] = specString.split(':');
    acc[specName] = value;
    return acc;
  }, {});
};

const setPetriSpecs = (petriString, specs) => {
  const petriObj = Object.entries(specs).reduce((obj, [specName, value]) => {
    if (value) {
      obj[specName] = value;
    } else {
      delete obj[specName];
    }

    return obj;
  }, parsePetriString(petriString));

  return Object.entries(petriObj).map(([key, val]) => `${key}:${val}`).join(';');
};

export const buildThunderboltUrl = async ({ queryObj, options }) => {
  const editor = await isEditor()
  const currentPetriOvr = queryObj.petri_ovr

  queryObj = omit(queryObj, [
    'viewerSource',
    'disableHtmlEmbeds',
    'disablePlatform',
    'disablePlatformApps',
    'editor-elements-override',
    'petri_ovr',
    'ssrDebug',
    'ssrIndicator',
    'ssrIndicator',
    'ssrOnly',
  ]);

  const {
    disableHtmlEmbeds,
    disablePlatform,
    disablePlatformApps,
    editorElementsOverride,
    excludeFromSsr,
    fleet,
    overrideThunderboltElements,
    shouldDisablePlatformApps,
    ssrIndicator,
    ssrOnly,
  } = options

  const rolloutThunderboltFleet = fleet !== 'ssrDebug' ? fleet : null

  const petriString = setPetriSpecs(currentPetriOvr, editor ? {
    "specs.UseTBAsMainRScript": 'true'
  } : {
    "specs.RolloutThunderboltFleet": rolloutThunderboltFleet,
    "specs.ExcludeSiteFromSsr": excludeFromSsr === 'true' ? 'true' : null,
  });

  const debugOption = editor ? { viewerSource: 'https://localhost:4200' } : { ssrDebug: 'true' }

  return {
    ...queryObj,
    ...disableHtmlEmbeds ? { disableHtmlEmbeds: 'true' } : {},
    ...disablePlatform ? { disablePlatform: 'true' } : {},
    ...fleet === 'ssrDebug' ? debugOption : {},
    ...overrideThunderboltElements ? { ['editor-elements-override']: editorElementsOverride } : {},
    ...petriString ? { petri_ovr: petriString } : {},
    ...shouldDisablePlatformApps ? { ['disablePlatformApps']: disablePlatformApps } : {},
    ...ssrIndicator && !editor ? { ssrIndicator: 'true' } : {},
    ...ssrOnly && !editor ? { ssrOnly } : {},
  };
};