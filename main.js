window.onload = function () {

    // Colors
    var WHITE_COLOR = "#ffffff",
        BLACK_COLOR = "#000",
        CURRENT_NODE_COLOR = "#ff3300",
        CURRENT_EDGE_COLOR = "#ff3300",
        DISABLED_COLOR = "#808080",
        VISIT_VERTEX_COLOR = "#808080",
        VISIT_EDGE_COLOR = "#808080",
        EXTRA_EDGE_COLOR = "#ffff00",
        FIRST_NODE_COLOR = "#00ff00",
        DEFAULT_NODE_COLOR = "#000",
        DEFAULT_EDGE_COLOR = "#000";

    // Canvas variables
    var canvas,
        ctx,
        nodes,
        draw,
        dragNode,
        dragPoint;

    var NODE_RANGE = 10;


    var info,
        addTextToInfo,
        clearInfo;

    // In algorithm div info field
    info = document.getElementById("info");
    // Add info to info field
    addTextToInfo = function (info) {
        info.innerHTML += "> " + info + "<br>";
        //info.scrollTop = 9999; // Scroll to last string in field
    };
    // Delete all info in field
    clearInfo = function () {
        info.innerHTML = "";
    };

    // Buttons
    var currentBtn, // Current selected button
        prevStyle, // Previous style of current button
        btnCreateNode,
        btnWork,
        btnPause,
        btnStop,
        btnView,
        btnClearCanvas,
        btnCreateRandomNodes,
        btnNextStep;

    btnCreateNode = document.getElementById('btn_create_node');
    btnCreateNode.addEventListener("click", function (event) {
        changeCurrentButton(btnCreateNode);
    }, false);

    btnView = document.getElementById('btn_view');
    btnView.addEventListener("click", function (event) {
        changeCurrentButton(btnView);
    }, false);

    btnClearCanvas = document.getElementById('btn_clear_canvas');
    btnClearCanvas.addEventListener("click", function (event) {
        clearNodes();
        draw();
    }, false);

    btnCreateRandomNodes = document.getElementById("btn_create_random_nodes");
    btnCreateRandomNodes.addEventListener("click", function (event) {
        createRandomNodes();
    }, false);

    /*
     Algorithm DIV BUTTONS
     */
    btnWork = document.getElementById("btn_work");
    btnWork.disabled = true;
    btnWork.addEventListener("click", function (event) {
        if(btnWork.disabled) return;
        if(isPaused || isStopped) {
            if(isFirstStart) {
                currentStep = startAlgorithm;
                btnStop.disabled = false;
                btnStop.src = "imgs/stop_red.png";
                isStopped = false;
                isFirstStart = false;
            }

            btnNextStep.disabled = true;
            btnNextStep.src = "imgs/next_black.png";
            btnWork.src = "imgs/pause_yellow.png";
            isPaused = false;
            nextStep(currentStep);
        } else {
            isPaused = true;
            btnWork.src = "imgs/start_green.png";
            btnNextStep.disabled = false;
            btnNextStep.src = "imgs/next_blue.png";
            clearTimeout(nextTimer);
        }
    }, false);

    btnStop = document.getElementById("btn_stop");
    btnStop.disabled = true;
    btnStop.src = "imgs/stop_black.png";
    btnStop.addEventListener("click", function (event) {
        if(btnStop.disabled) return;
        clearTimeout(nextTimer);
        isStopped = true;
        btnStop.disabled = true;
        btnStop.src = "imgs/stop_black.png";
        isPaused = false;
        btnWork.disabled = false;
        btnWork.src = "imgs/start_green.png";
        btnNextStep.disabled = true;
        btnNextStep.src = "imgs/next_black.png";
        isFirstStart = true;
        clearAlgorithmInfo();
    }, false);

    btnNextStep = document.getElementById("btn_next_step");
    btnNextStep.disabled = true;
    btnNextStep.src = "imgs/next_black.png";
    btnNextStep.addEventListener("click", function (event) {
        if(btnNextStep.disabled) return;
        isSkipped = true;
        nextStep(currentStep);
    }, false);

    var clearAlgorithmInfo = function () {
        clearInfo();
        recreateAlgorithmExtraInfo();
        // Clean table
        nodes.forEach(function (node) {
            node.setNodeColor(DEFAULT_NODE_COLOR); // Return back default color for vertices
            node.edge = undefined;
            node.extraEdge = undefined;
        });
    };

    var SRC_VIEW_CURRENT = "imgs/view_current.png",
        SRC_VIEW_BLACK = "imgs/view_black.png",
        SRC_CREATE_CURRENT = "imgs/create_current.png",
        SRC_CREATE_BLACK = "imgs/create_black.png";

    // Change current button for new one
    var changeCurrentButton = function (button) {
        //currentBtn.style = prevStyle; // Return previous style to previous current button
        // Change current button
        switch (button.id){
            case btnView.id:
                btnView.src = SRC_VIEW_CURRENT;
                btnCreateNode.src = SRC_CREATE_BLACK;
                break;
            case btnCreateNode.id:
                btnCreateNode.src = SRC_CREATE_CURRENT;
                btnView.src = SRC_VIEW_BLACK;
                break;
        }
        currentBtn = button;
        //setStyleToCurrentButton(currentBtn);
    };

    changeCurrentButton(btnView);

    var clearNodes = function () {
        nodes = []; // Create new graph
        btnWork.disabled = true;
    };

    var Node = function(id, pos){
        return {
            id: id,
            edge: undefined,
            extraEdge: undefined,
            x: pos.x,
            y: pos.y,
            color: DEFAULT_NODE_COLOR,

            // Set new color for vertex
            setNodeColor: function (color) {
                this.color = color;
                draw();
            },

            // Create new edge
            createEdge: function(to) {
                this.edge = {
                    color: DEFAULT_EDGE_COLOR,
                    to: Number(to),

                    setEdgeColor: function (color) {
                        this.color = color;
                        draw();
                    }
                };
                draw();
            },

            createExtraEdge: function(to) {
                this.extraEdge = {
                    color: EXTRA_EDGE_COLOR,
                    to: Number(to)
                };
                draw();
            }

        };
    };

    nodes = [];

    canvas = document.getElementById('canvas');

    ctx = canvas.getContext('2d');

    // Redraw canvas and his elements
    draw = function () {
        // Clear canvas
        ctx.fillStyle = WHITE_COLOR;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw edges (drawing edges before vertices locate edges under vertices)
        nodes.forEach(function (node) {
            [node.edge, node.extraEdge].forEach(function (edge) {
                if(edge === undefined) return;
                var from = node,
                    to = getNode(edge.to);
                ctx.fillStyle = BLACK_COLOR;
                ctx.strokeStyle = edge.color;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(from.x, from.y);
                ctx.lineTo(to.x, to.y);
                ctx.stroke();
            });
        });

        // Draw vertices
        nodes.forEach(function (node) {
            ctx.beginPath();
            ctx.fillStyle = node.color;
            ctx.strokeStyle = BLACK_COLOR;
            ctx.arc(node.x, node.y, NODE_RANGE, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = BLACK_COLOR;
            ctx.font = "30px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
        });
    };

    // Find node in graph by ID
    var getNode = function (ind) {
        return nodes[ind];
    };

    // Get from mouse event coordinates relatively left-top corner of canvas
    var getMousePosFromEvent = function (evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };

    // Find node by coordinates on canvas
    var getNodeByPos = function (pos) {
        var result = undefined;
        nodes.forEach(function (node) {
            if ((node.x - pos.x) * (node.x - pos.x) + (node.y - pos.y) * (node.y - pos.y)
                <= NODE_RANGE * NODE_RANGE) {
                result = node;
            }
        });
        return result;
    };

    // When the mouse is pressed find node and remember that in dragNode
    // dragPoint remember what place in node was pressed
    canvas.addEventListener('mousedown', function (event) {
        // This function need only for "View" mode
        // For trace node moving
        if (currentBtn !== btnView) {
            return;
        }
        var pos = getMousePosFromEvent(event);
        dragNode = getNodeByPos(pos);
        // Find dragPoint
        if (dragNode !== undefined) {
            dragPoint = {
                x: pos.x - dragNode.x,
                y: pos.y - dragNode.y
            }
        }
    }, false);

    // When the mouse is depressed, forgot current dragNode
    canvas.addEventListener('mouseup', function () {
        dragNode = undefined;
    }, false);

    // Change node coordinate if it was moved and redraw it
    canvas.addEventListener('mousemove', function (event) {
        var pos;
        if (dragNode !== undefined) {
            pos = getMousePosFromEvent(event);
            dragNode.x = pos.x - dragPoint.x;
            dragNode.y = pos.y - dragPoint.y;
            draw();
        }
    }, false);

    // Do action relatively current button mode
    canvas.addEventListener('click', function (event) {
        var pos = getMousePosFromEvent(event);
        switch (currentBtn.id) {
            case "btn_create_node":
                createNode(pos);
                break;
            default:
                return;
        }
        draw();
    }, false);

    var createNode = function (pos) {
        nodes.push(Node(nodes.length, pos));
        btnWork.disabled = false;
    };

    var createRandomNodes = function () {
        clearNodes();
        btnWork.disabled = false;

        // Ask vertex count
        var nodesCount = Number(document.getElementById("nodes_count").value);
        if(nodesCount > 50) return;

        // Save vertices position to colibrate their
        var nodesPos = [];

        var getRandomValue = function (limit) {
            return Math.floor(Math.random()*1000) % limit;
        };

        var compareCoordinateForCompatibility = function (pos1, pos2, withWhat) {
            return Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2) > withWhat * withWhat;
        };

        var checkBorders = function (pos) {
            var range = NODE_RANGE * 4;

            if(pos.x < range){
                pos.x += range;
            }
            if(canvas.width - pos.x < range){
                pos.x -= range;
            }
            if(pos.y < range){
                pos.y += range;
            }
            if(canvas.height - pos.y < range){
                pos.y -= range;
            }
            return pos;
        };

        var getRandomPos = function() {
            // For vertices don't touch the borders of canvas
            return checkBorders({
                x: getRandomValue(canvas.width),
                y: getRandomValue(canvas.height)
            });
        };

        var checkPosCompatibility = function (pos) {
            var check = true;
            nodesPos.forEach(function(nodePos) {
                check = check && compareCoordinateForCompatibility(pos, nodePos, NODE_RANGE * 4);
            });
            return check;
        };

        // Generate vertices
        for(var i = 0; i < nodesCount; i++){
            var pos = getRandomPos();
            while(!checkPosCompatibility(pos)){
                pos = getRandomPos();
            }
            nodesPos.push(pos);
            createNode(pos);
        }

        draw();
    };

    var recreateAlgorithmExtraInfo = function () {

    };

    // Variables for algorithm
    var STEP_TIME = Number(2),
        speedSelect, // What speed of algorithm
        getSpeed,
        nextStep,
        nextTimer,
        currentStep,
        isFirstStart = true,
        isStopped = true,
        isPaused = false,
        isSkipped = false,
        isPauseOrStop,
        firstNode,
        currentNode,
        nextNode,
        index,
        nextIndex;

    /*speedSelect = document.getElementById("speed_select");
    getSpeed = function () {
        return Number(speedSelect.options[speedSelect.options.selectedIndex].value);
    };*/

    // Do function after any time
    nextStep = function (func) {
        if(isSkipped){
            isSkipped = false;
            func();
            return;
        } else if(isPauseOrStop(func)) return;

        nextTimer = setTimeout(func, STEP_TIME*1000/* *(1/getSpeed())*/);
    };

    isPauseOrStop = function (func) {
        currentStep = func;
        return isStopped || isPaused;
    };

    nextIndex = function (currInd) {
        index = (currInd + 1) % nodes.length;
    };

    var startAlgorithm = function () {
        //addTextToInfo("Find the downiest node");
        nextStep(findFirstNodeStep);
    };

    var findFirstNodeStep = function () {
        firstNode = getNode(0);
        nodes.forEach(function (node) {
            if(node.y < firstNode.y) firstNode = node;
        });

        firstNode.setNodeColor(FIRST_NODE_COLOR);
        currentNode = firstNode;
        //addTextToInfo("The first node is <b>" + firstNode.id + "</b>");
        //addTextToInfo("Find next node");
        nextStep(findNextNodeStep);
    };

    var findNextNodeStep = function () {
        nextIndex(currentNode.id);
        currentNode.createEdge(index);
        nextNode = getNode(index);
        nextIndex(index);
        //addTextToInfo("Take next node" /*for ID node: <b>" + index + "</b>"*/);
        //addTextToInfo("Check this node with other nodes for rotation");
        nextStep(findMinNodeStep);
    };

    var findMinNodeStep = function () {
        if(index === currentNode.id){
            //addTextToInfo("All nodes is checked");
            nextStep(setNextNodeStep);
            return;
        }

        currentNode.createExtraEdge(index);
        //addTextToInfo("Check rotation with this node");
        nextStep(checkRotateStep);
    };

    var checkRotateStep = function () {
        var node = getNode(index);
        var rotate = (nextNode.x - currentNode.x)*(node.y - nextNode.y)
            - (nextNode.y - currentNode.y)*(node.x - nextNode.x);

        if(rotate < 0){
            nextNode = node;
            currentNode.createEdge(currentNode.extraEdge.to);
            /*addTextToInfo("This node more righter than current");
            addTextToInfo("Change the node");*/
        } else {
            /*addTextToInfo("This node less righter than current");
            addTextToInfo("Don't change the node");*/
        }

        currentNode.extraEdge = undefined;
        draw();

        nextIndex(index);
        //addTextToInfo("Check this node with other nodes for rotation");
        nextStep(findMinNodeStep);
    };
    
    var setNextNodeStep = function () {
        currentNode = nextNode;
        currentNode.setNodeColor(CURRENT_NODE_COLOR);
        if(currentNode.id === firstNode.id){
            //addTextToInfo("The algorithm returned in first node");
            nextStep(endAlgorithm);
        }
        else {
            nextStep(findNextNodeStep);
            //addTextToInfo("Find next node");
        }
    };

    var endAlgorithm = function () {
        //addTextToInfo("The algorithm is done working");
    };

    draw();

};