export default class ListNode {
    constructor(data, prev, next) {
        this.data = data;
        this.prev = prev;
        this.next = next;
    }

    insertNode(currentNode, newNode) {
        let next = currentNode.next;
        currentNode.next = newNode;
        newNode.prev = currentNode;
        newNode.next = next;
    }

    insertNodes(currentNode, newNodes) {
        let next = currentNode.next;
        currentNode.next = newNodes;
        newNodes.prev = currentNode;
        let endOfNew = newNodes;
        while (endOfNew.next != null) endOfNew = endOfNew.next;
        endOfNew.next = next;
    }
}

