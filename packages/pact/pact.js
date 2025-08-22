import {
  schedule,
  shouldYield,
  ImmediatePriority,
  UserBlockingPriority,
  NormalPriority,
  LowPriority,
  IdlePriority,
} from './scheduler/index.js';

function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) => (typeof child === 'object' ? child : createTextElement(child))),
    },
  };
}

function createTextElement(text) {
  return createElement('TEXT_ELEMENT', { nodeValue: text });
}

function createDom(fiber) {
  const dom = fiber.type == 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(fiber.type);

  updateDom(dom, {}, fiber.props);

  return dom;
}

const isEvent = (key) => key.startsWith('on');
const isProperty = (key) => key !== 'children' && !isEvent(key);
const isNew = (prev, next) => (key) => prev[key] !== next[key];
const isGone = (prev, next) => (key) => !(key in next);
const isRef = (key) => key == 'ref';

const toCssText = (style) => {
  style = JSON.parse(JSON.stringify(style));

  Object.keys(style).forEach((key) => {
    let newKey = key.replace(/[A-Z]/g, (match) => '-' + match.toLowerCase());
    if (newKey !== key) {
      style[newKey] = style[key];
      delete style[key];
    }
  });

  return Object.keys(style)
    .map((property) => `${property}:${style[property]}; `)
    .join('');
};

// usecase 1: when create a new dom as the second tree, we need the fiber to sync it's props
// usecase 2: when we conclues the effect list, we perform those effect through updates
function updateDom(dom, prevProps, nextProps) {
  //Remove old or changed event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });

  // Remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = '';
    });

  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      if (name === 'style') {
        dom.style.cssText = toCssText(nextProps[name]);
      } else {
        dom[name] = nextProps[name];
      }
    });

  // Add event listeners
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name]);
    });

  //bind ref
  Object.keys(nextProps)
    .filter(isRef)
    .forEach((name) => {
      nextProps[name].current = dom;
    });
}

let pendingEffects = [];
let effectCleanups = [];
function commitRoot() {
  effectList.forEach(commitWork);
  commitWork(wipRoot.child);
  effectCleanups.forEach((cleanup) => cleanup());
  effectCleanups = pendingEffects.map((effect) => effect()).filter((val) => typeof val === 'function');
  pendingEffects = [];
  // reset wipRoot and nextUnitOfWork
  currentRoot = wipRoot;
  wipRoot = null;
}

// unit work of commitRoot
function commitWork(fiber) {
  if (!fiber) return;

  let domParentFiber = fiber.parent;
  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent;
  }
  const domParent = domParentFiber.dom;

  if (fiber.effectTag === 'PLACEMENT' && fiber.dom != null) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === 'UPDATE' && fiber.dom != null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  } else if (fiber.effectTag === 'DELETION') {
    commitDeletion(fiber, domParent);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function commitDeletion(fiber, domParent) {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom);
  } else {
    commitDeletion(fiber.child, domParent);
  }
}

function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  };
  effectList = [];
  nextUnitOfWork = wipRoot;
  task.canceled = false;
  schedule((task = { callback: workLoop, canceled: false }));
}

// nextUnitOfWork are initiated to a newly created wipRoot
let nextUnitOfWork = null;
// constructed and rendered root of the element tree
let currentRoot = null;
// work in progress root of the element tree
let wipRoot = null;
// list of effect for commit phase
let effectList = null;

let task = { callback: null, canceled: true };

// work loop with scheduler
function workLoop() {
  while (nextUnitOfWork && !shouldYield()) nextUnitOfWork = performUnitOfWork(nextUnitOfWork);

  if (nextUnitOfWork) return workLoop;

  commitRoot();
  return null;
}

const isFunctionComponent = (fiber) => fiber.type instanceof Function;
const isContextProvider = (fiber) => 'context' in fiber;
const isMemoizedFiber = (fiber) => 'memoized' in fiber;
// wipRoot as fiber
function performUnitOfWork(fiber) {
  if (!isMemoizedFiber(fiber)) {
    if (isFunctionComponent(fiber)) {
      updateFunctionComponent(fiber);
    } else {
      updateHostComponent(fiber);
    }
    if (fiber.child) {
      return fiber.child;
    }
  }
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
}

let wipFiber = null;
let hookIndex = null;

function updateFunctionComponent(fiber) {
  wipFiber = fiber;
  hookIndex = 0;
  wipFiber.hooks = [];
  const children = [fiber.type(fiber.props)].flat(); // execute hooks
  reconcileChildren(fiber, children);
}

function updateHostComponent(fiber) {
  if (!fiber.dom) fiber.dom = createDom(fiber);

  reconcileChildren(fiber, fiber.props.children.flat());
}

const isMemoElement = (element) => 'compare' in element;
// creating fiber tree and add effects
function reconcileChildren(wipFiber, elements) {
  let index = 0;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let prevSibling = null;

  while (index < elements.length || oldFiber != null) {
    const element = elements[index];
    let newFiber = null;

    const sameType = oldFiber && element && element.type == oldFiber.type;
    const memoized = isMemoElement(element);

    const sameKey =
      oldFiber &&
      element &&
      element.props['key'] &&
      oldFiber.props['key'] &&
      element.props['key'] == oldFiber.props['key'];

    if (sameKey) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
      };
    } else if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: 'UPDATE',
      };
    } else if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: 'PLACEMENT',
      };
    } else if (oldFiber && !sameType) {
      oldFiber.effectTag = 'DELETION';
      effectList.push(oldFiber);
    }

    const context = {};
    if (isContextProvider(wipFiber)) {
      Object.assign(context, wipFiber.context);
      newFiber.context = context;
    }

    if (memoized && 'effectTag' in newFiber && newFiber.effectTag == 'UPDATE') {
      let shouldUpdate = false;

      if (Object.keys(oldFiber.props).length != Object.keys(newFiber.props).length) shouldUpdate = true;

      for (let key in oldFiber.props) {
        if (shouldUpdate) break;
        if (!key in newFiber.props) shouldUpdate = true;
        else if (!element.compare(oldFiber.props[key], newFiber.props[key])) shouldUpdate = true;
      }

      if (!shouldUpdate) {
        delete newFiber.effectTag;
        newFiber.memoized = true;
      }
    }

    if ('effectTag' in newFiber) effectList.push(newFiber);

    // move to next
    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      wipFiber.child = newFiber;
    } else if (element) {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
}

const update = (priority = NormalPriority) => {
  wipRoot = {
    dom: currentRoot.dom,
    props: currentRoot.props,
    alternate: currentRoot,
  };
  nextUnitOfWork = wipRoot;
  effectList = [];
  schedule(((task = { callback: workLoop, canceled: false }), { priority }));
};

function useState(initial) {
  initial = typeof initial == 'function' ? initial() : initial;
  const oldHook = wipFiber?.alternate?.hooks[hookIndex];

  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [],
  };

  const actions = oldHook ? oldHook.queue : [];
  actions.forEach((action) => {
    hook.state = action(hook.state);
  });

  const setState = (action) => {
    const mutate = typeof action == 'function' ? action : () => action;
    hook.queue.push(mutate);
    update();
  };

  wipFiber.hooks.push(hook);
  hookIndex++;
  return [hook.state, setState];
}

function useEffect(callback, dependencies) {
  const oldHook = wipFiber?.alternate?.hooks[hookIndex];

  const hasChanged =
    dependencies && oldHook ? dependencies.some((dep, index) => dep !== oldHook.dependencies[index]) : true;

  const hook = {
    callback: hasChanged ? callback : oldHook.callback,
    dependencies: hasChanged ? dependencies : oldHook.dependencies,
  };

  if (hasChanged) pendingEffects.push(hook.callback);

  wipFiber.hooks.push(hook);
  hookIndex++;
}

function useReducer(reducer, initialState) {
  const oldHook = wipFiber?.alternate?.hooks[hookIndex];

  const hook = {
    state: oldHook ? oldHook.state : initialState,
    dispatch: (action) => {
      hook.state = reducer(hook.state, action);
      update();
    },
  };

  wipFiber.hooks.push(hook);
  hookIndex++;
  return [hook.state, hook.dispatch];
}

function useMemo(factory, deps) {
  const oldHook = wipFiber?.alternate?.hooks[hookIndex];

  const hook = {
    deps: deps || [],
    value: oldHook ? oldHook.value : factory(),
  };

  const hasChanged = hook.deps.some((dep, index) => dep !== oldHook?.deps[index]);

  if (hasChanged) hook.value = factory();

  wipFiber.hooks.push(hook);
  hookIndex++;
  return hook.value;
}

function useCallback(callback, deps) {
  const oldHook = wipFiber?.alternate?.hooks[hookIndex];

  const hook = {
    callback: oldHook?.callback ? oldHook.callback : callback,
    deps: deps || [],
  };

  const hasChanged = hook.deps.some((dep, index) => dep !== oldHook?.deps[index]);

  if (hasChanged) {
    hook.callback = callback;
  }

  wipFiber.hooks.push(hook);
  hookIndex++;
  return hook.callback;
}

function useRef(initialValue) {
  const oldHook = wipFiber?.alternate?.hooks[hookIndex];
  if (oldHook) {
    wipFiber.hooks.push(oldHook);
    hookIndex++;
    return oldHook;
  }
  const hook = { current: initialValue };
  wipFiber.hooks.push(hook);
  hookIndex++;
  return hook;
}

let contextIndex = 0;
function createContext(defaultValue) {
  const contextId = '__Ctx' + contextIndex++;

  function Consumer(props, contextValue) {
    return props.children(contextValue);
  }

  function Provider(props) {
    const context = {
      [contextId]: { _id: contextId, _defaultValue: props.value },
    };

    if ('context' in this) Object.assign(context, this.context);

    this.context = context;
    return props.children;
  }

  const context = {
    _id: contextId,
    _defaultValue: defaultValue,
    Consumer,
    Provider,
  };

  return context;
}

function useContext(context) {
  if (isContextProvider(wipFiber) && context._id in wipFiber.context)
    return wipFiber.context[context._id]._defaultValue;

  return context._defaultValue;
}

const defaultCompare = (prop1, prop2) => prop1 === prop2;

function memo(component, compare = defaultCompare) {
  function Memoized(props) {
    return {
      type: component,
      props,
      compare,
    };
  }
  return Memoized;
}

export {
  createElement,
  render,
  useState,
  useEffect,
  useReducer,
  useMemo,
  useCallback,
  useRef,
  createContext,
  useContext,
  memo,
};
