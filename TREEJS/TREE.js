((w) => {
  let $TREE = w.$TREE;
  if (!w.$TREE) {
    w.$TREE = {};
  }
  // 排序函数
  function objSortBykey(objArr, key) {
    let result = objArr.slice(0);
    return result.sort((a, b) => a[key] - b[key]);
  }
  function TREEOBJ (pidKey, childrenKey, label, topPid) {
    // 对象主体
    this.pidKey = pidKey; // 所属父节点id key
    this.topPid = topPid; // 顶级父节点id
    this.childrenKey = childrenKey; // 子节点children
    this.label = label; // 节点labe 的key值

    // data 传进的树数据列表 pidKey 所属父级id对应的key值
    this.create = function (data, pidKey = this.pidKey, pid) {
      pid = pid || this.topPid; // 0为最高父级节点父id
      let list = [];
      data.map(item => {
        if (item[pidKey] == pid) {
          item[childrenKey] = this.create(data, pidKey, item.id);
          list.push(item);
        }
      });
      return list;
    };

    // 将树型结构数据处理成二位数组返回
    this.getTreeDataList = function (data) {
      const res = [];
      function getData(data) {
        data.forEach(v => {
          res.push(v);
          if (v[childrenKey]) {
            getData(v[childrenKey]);
          }
        });
      }
      getData(data);
      return res;
    };

    // 获取树节点的数量
    this.getTreeNodeCount = function (data) {
      return this.getTreeDataList(data).length || null;
    };

    // 根据对树节点的子节点根据key值进行排序
    this.sortTreeNodeChildrenByKey = function (data, id, key) {
      this.getTreeItem(data, id, item => {
        if (item) {
          item[childrenKey] = objSortBykey(item[childrenKey], key);
        }
      });
      return data;
    };

    // id获取节点递归函数
    this.getTreeItem = function (data, id, callBack) {
      data.map(item => {
        if (item.id == id) {
          callBack && (typeof callBack == 'function') && callBack(item);
        } else {
          if (item[childrenKey]) {
            this.getTreeItem(item[childrenKey], id, callBack);
          }
        }
      });
    };

    // 根绝树节点id获取树节点的值
    this.getTreeNodeById = function (data, id) {
      let result = null; // 运行结果
      this.getTreeItem(data, id, item => {
        result = item;
      });
      return result;
    };

    // 设置修改树中的key对象值
    this.setTreeNodeValue = function (data, id, key, value) {
      this.getTreeItem(data, id, item => {
        item[key] = value;
      });
    };

    // 根据id获取对应树中的key值
    this.getTreeNodeValueByKey = function (data, id, key) {
      let value = null;
      this.getTreeItem(data, id, item => {
        value = item[key];
      });
      return value;
    };

    // 根据id删除对应树中的key值
    this.delTreeNodeKey = function (data, id, key) {
      let value = null;
      this.getTreeItem(data, id, item => {
        value = item[key];
        if (key in item) {
          delete item[key];
        }
      });
      return value;
    };

    // 往树里面追加子节点
    this.appendChildrenNode = function (data, id, node = {}) {
      this.getTreeItem(data, id, item => {
        if (item) {
          if (item[childrenKey]) {
            item[childrenKey].push(node);
          } else {
            item[childrenKey] = [];
            item[childrenKey].push(node);
          }
        }
      });
      return data;
    };

    // 根据id 清空子节点
    this.clearChildrenNode = function (data, id) {
      this.getTreeItem(data, id, item => {
        if (item) {
          item[childrenKey] = [];
        }
      });
    };

    // 通过子节点id删除子节点
    this.delChildrenNodeById = function (data, id, childId) {
      this.getTreeItem(data, id, item => {
        if (item) {
          (item[childrenKey] || []).forEach((v, idx) => {
            if (v.id == childId) {
              item[childrenKey].splice(idx, 1);
            }
          });
        }
      });
    };

    // 获取父级节点
    this.getParentNode = function (data, id) {
      let currentNode = null;
      let parentNode = null;

      this.getTreeItem(data, id, item => {
        if (item) {
          currentNode = item;
        }
      });

      if (currentNode) {
        this.getTreeItem(data, currentNode[this.pidKey], item => {
          if (item) {
            parentNode = item;
          }
        });
      }

      return parentNode;
    };

    // 获取父级及祖先节点
    this.getParentNodes = function (data, id) {
      let parentNodes = this.getLevelNode(data, id);
      return parentNodes;
    };

    // 获取子节点及子孙所有节点
    this.getChildrenNodes = function (data, id) {
      let res = [];
      let childrens = [];
      this.getTreeItem(data, id, item => {
        if (item) {
          childrens = item[childrenKey];
        }
      });
      function getChs (data) {
        for (let i = 0, len = data.length; i < len; i++) {
          res.push(data[i]);
          if (data[i][childrenKey] && data[i][childrenKey].length > 0) {
            getChs(data[i][childrenKey]);
          }
        }
      }
      getChs(childrens);
      return res;
    };

    // 获取子节点及子节点
    this.getChildrenNode = function (data, id) {
      let childrens = [];
      this.getTreeItem(data, id, item => {
        if (item) {
          childrens = item[childrenKey];
        }
      });
      return childrens;
    };

    // 辅组查询层级递归遍历函数
    this.getTreeLevelNode = function (data, id, topPid = this.topPid, result, pidKey = this.pidKey) {
      let currentId = id;
      let node = this.getTreeNodeById(data, currentId);
      result.push(node);
      if (node && node[pidKey] && node[pidKey] !== topPid) {
        this.getTreeLevelNode(data, node[pidKey], topPid, result, pidKey);
      }
    };

    // 根据id获取当前树节点的层级节点数据（倒序）, topPid 最顶级父节点id
    this.getLevelNode = function (data, id, topPid = this.topPid, pidKey = this.pidKey) {
      let result = [];
      this.getTreeLevelNode(data, id, topPid, result, pidKey);
      return result || [];
    };

    // 获取当前节点层级
    this.getNodeLevel = function (data, id) {
      const res = this.getLevelNode(data, id);
      return res.length || 0;
    };
    
  }

  w.$TREE = TREEOBJ;
})(window);