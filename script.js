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
function  optimizeBlockPlacement (blocks, container) {
    const totalBlockArea = blocks.reduce((total, { width, height }) => total + width * height, 0);

    const internalCavitiesArea = container.internalCavities.reduce(
        (total, { left, right, top, bottom }) => total + (right - left) * (bottom - top),
        0
    );

    const fullness = 1 - internalCavitiesArea / (internalCavitiesArea + totalBlockArea);

    const blockCoordinates = blocks
        .filter(({ isPlaced }) => isPlaced)
        .map(({ coordinates, initialOrder, color }) => ({
            ...coordinates,
            initialOrder,
            color,
        }));

    return { fullness, blockCoordinates };
}
function placeBlocks(blocks, container) {
    blocks.sort((a, b) => b.width * b.height - a.width * a.height);

    for (const block of blocks) {
        const spaceIndex = container.internalCavities.findIndex(
            (space) =>
                block.width <= space.right - space.left &&
                block.height <= space.bottom - space.top
        );

        if (spaceIndex !== -1) {
            const space = container.internalCavities[spaceIndex];

            block.coordinates = {
                top: space.top,
                left: space.left,
                right: Math.min(space.left + block.width, space.right),
                bottom: Math.min(space.top + block.height, space.bottom),
            };

            block.isPlaced = true;
            const newInternalCavities = [
                { top: space.top, left: space.left, right: space.right, bottom: block.coordinates.top },
                { top: block.coordinates.bottom, left: space.left, right: space.right, bottom: space.bottom },
                { top: space.top, left: space.left, right: block.coordinates.left, bottom: block.coordinates.bottom },
                { top: space.top, left: block.coordinates.right, right: space.right, bottom: block.coordinates.bottom },
            ];

            container.internalCavities.splice(spaceIndex, 1, ...newInternalCavities);
        } else {
            console.error(`Cannot place block with width ${block.width} and height ${block.height}.`);
        }
    }

    Color(blocks);

    return optimizeBlockPlacement (blocks, container);
}


function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function  Color (blocks) {
    const uniqueBlockSizes = {};
    for (const block of blocks) {
        const { width, height } = block;

        if (block.color === null) {
            block.color = uniqueBlockSizes[`${width}-${height}`] || getRandomColor();
            uniqueBlockSizes[`${width}-${height}`] = block.color;
        }
    }
}

async function loadBlocksData() {
    const response = await fetch("blocks.json");
    const data = await response.json();
    const containerSize = data.containerSize;
    const blocksInfo = data.blocks.map((blockInfo) => createBlock(blockInfo.width, blockInfo.height, blockInfo.initialOrder));

    return { containerSize, blocksInfo };
}

function update(result, containerSize) {
    const containerDiv = document.getElementById("container");
    containerDiv.style.width = containerSize.width + "px";
    containerDiv.style.height = containerSize.height + "px";

    const fullness = document.getElementById("fullness-value");
    fullness.textContent = result.fullness.toFixed(2);

    containerDiv.innerHTML = "";

    result.blockCoordinates.forEach((coords) => {
        const block = document.createElement("div");
        block.className = "block";
        block.textContent = `${coords.initialOrder}`;
        block.style.width = `${coords.right - coords.left}px`;
        block.style.height = `${coords.bottom - coords.top}px`;
        block.style.top = `${coords.top}px`;
        block.style.left = `${coords.left}px`;
        block.style.right = `${coords.right}px`;
        block.style.bottom = `${coords.bottom}px`;
        block.style.backgroundColor = `${coords.color}`;
        containerDiv.appendChild(block);
    });
}

// async function display() {
//     const { containerSize, blocksInfo } = await loadBlocksData();
//     const blocks = blocksInfo.map((info) => createBlock(info.width, info.height, info.initialOrder));
//     const container = createContainer(containerSize);
//
//     const result = placeBlocks(blocks, container);
//     update(result, containerSize);
//
//     window.addEventListener("resize", () => {
//         containerSize.width = window.innerWidth;
//         containerSize.height = window.innerHeight;
//         const result = placeBlocks(blocks, createContainer(containerSize));
//         update(result, containerSize);
//     });
// }
//
// window.onload = display();
//

// Asynchronous function to display the optimized block placement.
async function display() {
    // Load container size and block information from JSON data.
    const { containerSize, blocksInfo } = await loadBlocksData();

    // Create block objects and container based on the loaded data.
    const blocks = blocksInfo.map((info) => createBlock(info.width, info.height, info.initialOrder));
    const container = createContainer(containerSize);

    // Check if the total block volume exceeds the container size.
    if (isExceedingContainer(blocks, containerSize)) {
        console.error("Container cannot accommodate all blocks. Please use a larger container.");
        return;
    }

    // Place blocks within the container and update the UI.
    const result = placeBlocks(blocks, container);
    update(result, containerSize);

    // Add a resize event listener to handle changes in the window size.
    window.addEventListener("resize", () => {
        containerSize.width = window.innerWidth;
        containerSize.height = window.innerHeight;

        // Check if the total block volume exceeds the new container size.
        if (isExceedingContainer(blocks, containerSize)) {
            console.error("Container cannot accommodate all blocks. Please use a larger container.");
            return;
        }

        // Place blocks within the updated container and update the UI.
        const result = placeBlocks(blocks, createContainer(containerSize));
        update(result, containerSize);
    });
}

// Function to check if the total block volume exceeds the container size.
function isExceedingContainer(blocks, containerSize) {
    const totalBlockVolume = blocks.reduce((total, { width, height }) => total + width * height, 0);
    return totalBlockVolume > containerSize.width * containerSize.height;
}

// Trigger the display function when the window is fully loaded.
window.onload = display();

