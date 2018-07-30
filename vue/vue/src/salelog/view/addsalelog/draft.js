/**
 * 将手动保存的视为模板，自动保存的视为草稿。
 */

function getObjectByKey(key) {
    try {
        var obj = localStorage.getItem(key);
        return JSON.parse(obj);
    } catch (e) {
        return null;
    }
}

function saveObject(key, obj) {
    localStorage.setItem(key, JSON.stringify(obj));
}

function buildDraftKey() {
    return "salelog_draft";
}

function buildTemplateKey() {
    return "salelog_template";
}

function buildProjectKey() {
    return "salelog_project";
}

module.exports = {

    getTemplateCount() {
        var list = this.getTemplateList();
        return list.length;
    },

    getTemplateList() {
        var resultList = [];

        var list = getObjectByKey(buildTemplateKey());
        if (list) {
            resultList = resultList.concat(list);
        }

        return resultList;
    },

    /***
     * @return boolean 保存是否成功
     */
    saveTemplate(salelog) {
        if (!salelog) {
            return false;
        }
        var key = buildTemplateKey();
        var list = getObjectByKey(key);
        if (!list) {
            list = [];
        }
        salelog.tempInfo = {
            id: new Date().getTime(),//这个唯一性应该够了吧
        };
        list.push(salelog);
        saveObject(key, list);
        return true;
    },

    /**
     * @param id 标志模板唯一的id：salelog.tempInfo.id
     *
     * @return boolean 删除是否成功
     */
    deleteTemplate(id) {
        var key = buildTemplateKey();
        var list = getObjectByKey(key);
        if (!list) {
            return false;
        }
        var targetIndex = -1;
        for (var index = 0; index < list.length; index++) {
            var item = list[index];
            if (item.tempInfo && item.tempInfo.id == id) {
                targetIndex = index;
                break;
            }
        }
        if (targetIndex > -1) {
            list.splice(targetIndex, 1);
        }

        saveObject(key, list);
        return targetIndex > -1;
    },

    /**
     * @param salelog 要保存的草稿，为null则会删掉草稿
     */
    saveDraft(salelog) {
        var key = buildDraftKey();
        saveObject(key, salelog);
    },
    clearDraft() {
        this.saveDraft(null);
    },

    /**
     * 获取自动保存的草稿，可能为null
     */
    getDraft() {
        var key = buildDraftKey();
        return getObjectByKey(key);
    },

    /**
     * 保存最近所填写的项目
     * @param project 为null则算清除
     */
    saveLastProject(project) {
        var key = buildProjectKey();
        saveObject(key, project);
    },

    /**
     * 获取最近所填写的项目，可能为null
     */
    getLastProject() {
        var key = buildProjectKey();
        return getObjectByKey(key);
    },
};