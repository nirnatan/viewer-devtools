/* global _ */
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
    throw new Error(`${ERROR_HEADER} No such pageId, pageRef, compId or compRef.`);
  }
  return _.isString(id) ? editorAPI.components.get.byId(id) : id;
}

function init({ editorAPI, editorModel }) {
  const getAllComps = () => getAllComponents(editorAPI);

  const getAllPages = () => getAllPagesInEditor(editorAPI);

  const getPagesMap = () => {
    return _.reduce(editorAPI.pages.getPageIdList(), (acc, value) => {
      acc.push({ id: value, title: editorAPI.pages.data.get(value).title });
      return acc;
    }, []);
  };

  const getAllCompsInCurrentPage = () => editorAPI.components.getAllComponents(editorAPI.pages.getCurrentPage().id);

  const getAllCompsIn = pageId => {
    if (!isValidIdOrRef(pageId)) {
      throw new Error(`${ERROR_HEADER} No such pageId or PageRef`);
    }
    return editorAPI.components.getAllComponents(pageId);
  };

  const getRef = id => getCompRef(editorAPI, id);

  const getSelected = () => {
    const selected = editorAPI.selection.getSelectedComponents();
    if (!_.isEmpty(selected)) {
      return selected[0];
    }
    throw new Error(`${ERROR_HEADER} No component selected.`);
  };

  const getData = ref => {
    if (!isValidIdOrRef(getAllPagesInEditor(editorAPI), getAllComponents(editorAPI), ref)) {
      throw new Error(`${ERROR_HEADER} No such pageId, pageRef, compId or compRef.`);
    }
    ref = getRef(ref);
    return editorAPI.components.data.get(ref);
  };

  const getLayout = ref => {
    if (!isValidIdOrRef(getAllPagesInEditor(editorAPI), getAllComponents(editorAPI), ref)) {
      throw new Error(`${ERROR_HEADER} No such pageId, pageRef, compId or compRef.`);
    }
    ref = _.isString(ref) ? editorAPI.components.get.byId(ref) : ref;
    return editorAPI.components.layout.get(ref);
  };

  const getSkin = ref => {
    if (!isValidIdOrRef(getAllPagesInEditor(editorAPI), getAllComponents(editorAPI), ref)) {
      throw new Error(`${ERROR_HEADER} No such pageId, pageRef, compId or compRef.`);
    }
    ref = getRef(ref);
    return editorAPI.components.skin.get(ref);
  };

  const getType = ref => {
    if (!isValidIdOrRef(getAllPagesInEditor(editorAPI), getAllComponents(editorAPI), ref)) {
      throw new Error(`${ERROR_HEADER} No such pageId, pageRef, compId or compRef.`);
    }
    ref = getRef(ref);
    return editorAPI.components.getType(ref);
  };

  const getStyle = ref => {
    if (!isValidIdOrRef(getAllPagesInEditor(editorAPI), getAllComponents(editorAPI), ref)) {
      throw new Error(`${ERROR_HEADER} No such pageId, pageRef, compId or compRef.`);
    }
    ref = getRef(ref);
    return editorAPI.components.style.get(ref);
  };

  const getSerialize = ref => {
    if (!isValidIdOrRef(getAllPagesInEditor(editorAPI), getAllComponents(editorAPI), ref)) {
      throw new Error(`${ERROR_HEADER} No such pageId, pageRef, compId or compRef.`);
    }
    ref = getRef(ref);
    return editorAPI.components.serialize(ref);
  };

  const getPageOf = ref => {
    if (!isValidIdOrRef(getAllPagesInEditor(editorAPI), getAllComponents(editorAPI), ref)) {
      throw new Error(`${ERROR_HEADER} No such pageId, pageRef, compId or compRef.`);
    }
    ref = getRef(ref);
    const pageRef = editorAPI.components.getPage(ref);
    const page = getPagesMap().filter(p => p.id === pageRef.id);
    return page[0];
  };

  const getParentOf = ref => {
    if (!isValidIdOrRef(getAllPagesInEditor(editorAPI), getAllComponents(editorAPI), ref)) {
      throw new Error(`${ERROR_HEADER} No such pageId, pageRef, compId or compRef.`);
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

  const updateData = (ref, newData) => {
    if (!isValidIdOrRef(getAllPagesInEditor(editorAPI), getAllComponents(editorAPI), ref)) {
      throw new Error(`${ERROR_HEADER} No such pageId, pageRef, compId or compRef.`);
    }
    ref = getRef(ref);
    return editorAPI.components.data.update(ref, newData);
  };

  const updateLayout = (ref, newLayout) => {
    if (!isValidIdOrRef(getAllPagesInEditor(editorAPI), getAllComponents(editorAPI), ref)) {
      throw new Error(`${ERROR_HEADER} No such pageId, pageRef, compId or compRef.`);
    }
    ref = getRef(ref);
    return editorAPI.components.layout.update(ref, newLayout);
  };

  const updateStyle = (ref, newStyle) => {
    if (!isValidIdOrRef(getAllPagesInEditor(editorAPI), getAllComponents(editorAPI), ref)) {
      throw new Error(`${ERROR_HEADER} No such pageId, pageRef, compId or compRef.`);
    }
    ref = getRef(ref);
    return editorAPI.components.style.update(ref, newStyle);
  };

  const updateSelectedData = newData => {
    const ref = getSelected();
    return editorAPI.components.data.update(ref, newData);
  };

  const updateSelectedLayout = newLayout => {
    const ref = getSelected();
    return editorAPI.components.layout.update(ref, newLayout);
  };

  const updateSelectedStyle = newStyle => {
    const ref = getSelected();
    return editorAPI.components.style.update(ref, newStyle);
  };

  const serializeSelected = () => {
    const ref = getSelected();
    return editorAPI.components.serialize(ref);
  };

  const selectComp = ref => {
    if (!isValidIdOrRef(getAllPagesInEditor(editorAPI), getAllComponents(editorAPI), ref)) {
      throw new Error(`${ERROR_HEADER} No such pageId, pageRef, compId or compRef.`);
    }
    ref = getRef(ref);
    editorAPI.selection.selectComponentByCompRef(ref);
  };

  const navigateTo = ref => {
    if (!isValidIdOrRef(getAllPagesInEditor(editorAPI), getAllComponents(editorAPI), ref)) {
      throw new Error(`${ERROR_HEADER} No such pageId, pageRef, compId or compRef.`);
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
        editorAPI.documentServices.waitForChangesApplied(() => {
          console.log(getSerialize(ref)); // eslint-disable-line no-console
          editorAPI.scroll.scrollTo({ scrollTop: getSelectedLayout().y });
        });
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

  const openSentryWithMetaSiteFiltering = () => window.open(`https://sentry.io/wix_o/santa-editor/?query=metaSiteId:"${editorModel.metaSiteId}"`, '_blank');

  const openFullStoryForUser = () => window.open(`https://app.fullstory.com/ui/1zuo/segments/everyone/people:search:((NOW%2FDAY-29DAY:NOW%2FDAY%2B1DAY):((UserAppKey:==:"${editorModel.permissionsInfo.loggedInUserId}")):():():():)/0`, '_blank');

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
    get: {
      allComps: getAllComps,

      allPages: getAllPages,

      pagesMap: getPagesMap,

      allCompsInCurrentPage: getAllCompsInCurrentPage,

      allCompsIn: getAllCompsIn,

      pointerOf: getRef,

      data: getData,

      layout: getLayout,

      skin: getSkin,

      type: getType,

      style: getStyle,

      selected: getSelected,

      serialize: getSerialize,

      serializeSelected,

      selectedType: getSelectedType,

      selectedLayout: getSelectedLayout,

      selectedData: getSelectedData,

      selectedStyle: getSelectedStyle,

      selectedSkin: getSelectedSkin,

      pageOf: getPageOf,

      parentOf: getParentOf,
    },

    update: {
      data: updateData,

      layout: updateLayout,

      style: updateStyle,

      selectedData: updateSelectedData,

      selectedLayout: updateSelectedLayout,

      selectedStyle: updateSelectedStyle,
    },

    open: {
      preview: openPreview,

      liveSite: openLiveSite,

      liveSiteWithoutSSR: openLiveSiteWithoutSSR,

      oldBoForSite: openOldBoForSite,

      newBoForUser: openNewBoForUser,

      withClosedExperiments: openWithClosedExperiments,

      sentryWithUserFiltering: openSentryWithUserFiltering,

      sentryWithMetaSiteFiltering: openSentryWithMetaSiteFiltering,

      fullStoryForUser: openFullStoryForUser,
    },

    selectComp,

    navigateTo,

    deleteAllPagesExceptCurrent,

    resetMobileLayoutOnAllPages,

    removePageById,
  };
}

module.exports = { init };
