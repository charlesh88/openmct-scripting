function getNodePrlText(node) {
    const textNode = node
        .getElementsByTagName("prl:Description")[0]
        .getElementsByTagName("prl:Text")[0];
    if (textNode) {
        return textNode.textContent;
    } else {
        return undefined;
    }
}
