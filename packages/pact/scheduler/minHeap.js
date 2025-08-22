export const Heap = (heap = [], cmp = (a, b) => a - b) => ({
  push: (node) => {
    const index = heap.length;
    heap.push(node);
    siftUp(heap, node, index, cmp);
  },
  peek: () => (heap.length === 0 ? null : heap[0]),
  pop: () => {
    if (heap.length === 0) return null;

    const first = heap[0];
    const last = heap.pop();
    if (last !== first) {
      heap[0] = last;
      siftDown(heap, last, 0, cmp);
    }
    return first;
  },
  size: () => heap.length,
  isEmpty: () => heap.length === 0,
  clear: () => {
    heap.length = 0;
  },
});

function siftUp(heap, node, index, cmp) {
  while (index > 0) {
    const parentIndex = (index - 1) >>> 1;
    const parent = heap[parentIndex];
    if (cmp(node, parent) < 0) {
      heap[parentIndex] = node;
      heap[index] = parent;
      index = parentIndex;
    } else return;
  }
}

function siftDown(heap, node, index, cmp) {
  const length = heap.length;
  const halfLength = length >>> 1;
  while (index < halfLength) {
    const leftIndex = (index + 1) * 2 - 1;
    const left = heap[leftIndex];
    const rightIndex = leftIndex + 1;
    const right = heap[rightIndex];
    if (rightIndex < length && cmp(right, left) < 0 && cmp(right, node) < 0) {
      heap[index] = right;
      heap[rightIndex] = node;
      index = rightIndex;
    } else if (leftIndex < length && cmp(left, node) < 0) {
      heap[index] = left;
      heap[leftIndex] = node;
      index = leftIndex;
    } else return;
  }
}
