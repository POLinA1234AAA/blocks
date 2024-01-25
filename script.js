function createBlock(width, height, initialOrder) {
    return {
        width: width,
        height: height,
        isPlaced: false,
        coordinates: { top: null, left: null, right: null, bottom: null },
        color: null,
        initialOrder: initialOrder,
    };
}