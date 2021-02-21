// 通过Proxy实现

/**
 * 1. 数据 -> 响应式的数据 Object.defineProperty Proxy
 * 2. input -> input/keyup -> 事件处理函数的绑定 -> 改变数据
 * 3. 相关的DOM -> 数据 -> 绑定在一起
 *    操作数据的某个属性 -> 对应DOM就改变
 */

class Mvvm {
  constructor (el, data) {
    this.el = document.querySelector(el);
    this.data = data;
    this.domPool = {};

    this.init();
  }

  init () {
    this.initData();
    this.initDom();
  }

  // 初始化数据
  initData () {
    const _this = this;
    
    this.data = new Proxy(this.data, {
      get (target, key) {
        return Reflect.get(target, key);
      },
      set (target, key, value) {
        _this.domPool[key].innerHTML = value;
        return Reflect.set(target, key, value);
      }
    })
  }

  initDom () {
    this.bindDom(this.el);
    this.bindInput(this.el);
  }

  bindDom (el) {
    const childNodes = el.childNodes;

    childNodes.forEach(item => {
      // 如果是文本节点
      if (item.nodeType === 3) {
        // 获取文本节点的值
        const _value = item.nodeValue;
        const reg_val = /\{\{(.+?)\}\}/;

        if (_value.trim().length) {
          // 判断是否有双大括号
          const _isValid = reg_val.test(_value)

          if (_isValid) {
            // 获取双大括号里面的值
            const _key = _value.match(reg_val)[1].trim();
            // 以_key为键值，当前节点的父节点为值，给domPool添加属性，之所哟要保存父节点，是为了方便直接替换父节点的innerHTML
            this.domPool[_key] = item.parentNode;
            item.parentNode.innerHTML = this.data[_key] || undefined;
          }
        }
      }
      // 如果当前节点还有子节点，就递归
      item.childNodes && this.bindDom(item);
    })
  }

  // 给所有input绑定keyup事件处理函数
  bindInput (el) {
    const _allInputs = el.querySelectorAll('input');

    _allInputs.forEach(input => {
      const _vModel = input.getAttribute('v-model');

      if (_vModel) {
        input.addEventListener('keyup', this.handleInput.bind(this, _vModel, input), false);
      }
    });
  }
  // input事件处理函数
  handleInput (key, input) {
    const _value = input.value;
    this.data[key] = _value;
  }

  setData (key, value) {
    this.data[key] = value;
  }
}