const _ = require('lodash'); // should it be here or take it from the window?

const ERROR_HEADER = 'Pro Debugger Error:';

function getAllComponents(editorAPI) {
  return editorAPI.components.getAllComponents();
}

function getAllPagesInEditor(editorAPI) {
  return editorAPI.pages.getPageIdList();
}

function isValidIdOrRef(allPages, allComps, ref) {
  if (_.isObject(ref)) {
    ref = ref.id;
  }
  if (_.isString(ref) && _.includes(allPages, ref)) {
    return true;
  }
  return _.includes(_.mapValues(allComps, pointer => {
    return pointer.id;
  }), ref);
}

function getCompRef(editorAPI, id) {
  const allComps = getAllComponents(editorAPI);
  const allPages = getAllPagesInEditor(editorAPI);
  if (!isValidIdOrRef(allPages, allComps, id)) {
    throw new Error(`${ERROR_HEADER} No such pageId, compId or compRef.`);
  }
  return _.isString(id) ? editorAPI.components.get.byId(id) : id;
}

function init(window) {
  const { editorAPI, editorModel } = window;

  const getAllComps = () => getAllComponents(editorAPI);

  const getAllPages = () => getAllPagesInEditor(editorAPI);

  const getPagesMap = () => {
    return _.reduce(editorAPI.pages.getPageIdList(), (acc, value) => {
      acc.push({ id: value, title: editorAPI.pages.data.get(value).title });
      return acc;
    }, []);
  };

  const getRef = _.partial(getCompRef, editorAPI);

  const getSelected = () => {
    const selected = editorAPI.selection.getSelectedComponents();
    if (!_.isEmpty(selected)) {
      return selected[0];
    }
    throw new Error(`${ERROR_HEADER} No component selected.`);
  };

  const getData = ref => {
    if (!isValidIdOrRef(getAllPagesInEditor(editorAPI), getAllComponents(editorAPI), ref)) {
      throw new Error(`${ERROR_HEADER} No such pageId, compId or compRef.`);
    }
    ref = getRef(ref);
    return editorAPI.components.data.get(ref);
  };

  const getLayout = ref => {
    if (!isValidIdOrRef(getAllPagesInEditor(editorAPI), getAllComponents(editorAPI), ref)) {
      throw new Error(`${ERROR_HEADER} No such pageId, compId or compRef.`);
    }
    ref = _.isString(ref) ? editorAPI.components.get.byId(ref) : ref;
    return editorAPI.components.layout.get(ref);
  };

  const getSkin = ref => {
    if (!isValidIdOrRef(getAllPagesInEditor(editorAPI), getAllComponents(editorAPI), ref)) {
      throw new Error(`${ERROR_HEADER} No such pageId, compId or compRef.`);
    }
    ref = getRef(ref);
    return editorAPI.components.skin.get(ref);
  };

  const getType = ref => {
    if (!isValidIdOrRef(getAllPagesInEditor(editorAPI), getAllComponents(editorAPI), ref)) {
      throw new Error(`${ERROR_HEADER} No such pageId, compId or compRef.`);
    }
    ref = getRef(ref);
    return editorAPI.components.getType(ref);
  };

  const getStyle = ref => {
    if (!isValidIdOrRef(getAllPagesInEditor(editorAPI), getAllComponents(editorAPI), ref)) {
      throw new Error(`${ERROR_HEADER} No such pageId, compId or compRef.`);
    }
    ref = getRef(ref);
    return editorAPI.components.style.get(ref);
  };

  const getPageOf = ref => {
    if (!isValidIdOrRef(getAllPagesInEditor(editorAPI), getAllComponents(editorAPI), ref)) {
      throw new Error(`${ERROR_HEADER} No such pageId, compId or compRef.`);
    }
    ref = getRef(ref);
    const pageRef = editorAPI.components.getPage(ref);
    const page = getPagesMap().filter(p => p.id === pageRef.id);
    return page[0];
  };

  const getParentOf = ref => {
    if (!isValidIdOrRef(getAllPagesInEditor(editorAPI), getAllComponents(editorAPI), ref)) {
      throw new Error(`${ERROR_HEADER} No such pageId, compId or compRef.`);
    }
    ref = getRef(ref);
    return editorAPI.components.getContainer(ref);
  };

  const getSelectedType = () => {
    const ref = getSelected();
    return getType(ref);
  };

  const getSelectedData = () => {
    const ref = getSelected();
    return getData(ref);
  };

  const getSelectedLayout = () => {
    const ref = getSelected();
    return getLayout(ref);
  };

  const getSelectedStyle = () => {
    const ref = getSelected();
    return getStyle(ref);
  };

  const getSelectedSkin = () => {
    const ref = getSelected();
    return getSkin(ref);
  };

  const serializeSelected = () => {
    const ref = getSelected();
    return editorAPI.components.serialize(ref);
  };

  const selectComp = ref => {
    if (!isValidIdOrRef(getAllPagesInEditor(editorAPI), getAllComponents(editorAPI), ref)) {
      throw new Error(`${ERROR_HEADER} No such pageId, compId or compRef.`);
    }
    ref = getRef(ref);
    editorAPI.selection.selectComponentByCompRef(ref);
  };

  const navigateTo = ref => {
    if (!isValidIdOrRef(getAllPagesInEditor(editorAPI), getAllComponents(editorAPI), ref)) {
      throw new Error(`${ERROR_HEADER} No such pageId, compId or compRef.`);
    }
    if (_.includes(getAllPagesInEditor(editorAPI), ref)) {
      editorAPI.pages.navigateTo(ref);
    } else {
      if (_.isString(ref)) {
        ref = getRef(ref);
      }
      editorAPI.pages.navigateTo(getPageOf(ref).id);
      editorAPI.documentServices.waitForChangesApplied(() => {
        selectComp(ref);
        console.log(serializeSelected()); // eslint-disable-line no-console
        editorAPI.scroll.scrollTo({ scrollTop: getSelectedLayout().y });
      });
    }
  };

  const openPreview = () => window.open(editorModel.previewUrl, '_blank');

  const openLiveSite = () => window.open(editorModel.publicUrl, '_blank');

  const openLiveSiteWithoutSSR = () => window.open(`${editorModel.publicUrl}?forceSsr=false&petri_ovr=specs.SantaServerSideRendering:false&debug=all`, '_blank');

  const openOldBoForSite = () => window.open(`https://bo.wix.com/bo/api/userManager?siteSubmitData=${editorModel.metaSiteId}`, '_blank');

  const openNewBoForUser = () => window.open(`https://bo.wix.com/user-manager/users/byGuid/${editorModel.permissionsInfo.loggedInUserId}`, '_blank');

  const openWithClosedExperiments = () => window.open(window.location.href.concat('&experimentsoff=').concat(Object.keys(editorModel.runningExperiments).join(',')));

  const openSentryWithUserFiltering = () => window.open(`https://sentry.io/wix_o/santa-editor/?query=user:"id:${editorModel.permissionsInfo.loggedInUserId}"`, '_blank');

  const deleteAllPagesExceptCurrent = () => {
    const currentPage = editorAPI.pages.getCurrentPage().id;
    const pagesToDelete = _.filter(getAllPagesInEditor(editorAPI), page => {
      return page !== currentPage;
    });
    _.forEach(pagesToDelete, page => {
      editorAPI.pages.remove(page);
    });
  };

  const resetMobileLayoutOnAllPages = () => {
    editorAPI.mobileConversion.resetMobileLayoutOnAllPages();
  };

  const removePageById = pageId => {
    if (!_.includes(getAllPagesInEditor(editorAPI), pageId)) {
      throw new Error(`${ERROR_HEADER} No such pageId.`);
    }
    editorAPI.pages.remove(pageId);
  };

  return {
    getAllComps,

    getAllPages,

    getPagesMap,

    getRef,

    getData,

    getSelected,

    getSelectedLayout,

    getSkin,

    getType,

    getStyle,

    getPageOf,

    getParentOf,

    getSelectedType,

    getSelectedData,

    getSelectedStyle,

    getSelectedSkin,

    serializeSelected,

    selectComp,

    navigateTo,

    openPreview,

    openLiveSite,

    openLiveSiteWithoutSSR,

    openOldBoForSite,

    openNewBoForUser,

    openWithClosedExperiments,

    deleteAllPagesExceptCurrent,

    resetMobileLayoutOnAllPages,

    removePageById,

    openSentryWithUserFiltering,
  };
}

module.exports = init;
