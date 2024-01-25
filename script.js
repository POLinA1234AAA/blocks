function createBlock(width, height, initialOrder) {
    return {
        color: null,
        width: width,
        height: height,
        isPlaced: false,
        coordinates: { top: null,  right: null, bottom: null, left: null},
        initialOrder: initialOrder,
    };
}
function createContainer(containerSize) {
    return {
        width: containerSize.width,
        height: containerSize.height,
        internalCavities: [
            { top: 0, left: 0, right: containerSize.width, bottom: containerSize.height },
        ],
    };
}