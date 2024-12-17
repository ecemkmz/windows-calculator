document.addEventListener("DOMContentLoaded", () => {
  const inputField = document.getElementById("cal");
  const historyField = document.getElementById("history");
  const buttons = document.querySelectorAll(
    ".numbersAndBasicOperations button, .topOperations button"
  );
  const backspaceButton = document.querySelector(".fa-delete-left");
  const historyOverlay = document.getElementById("history-overlay");
  const historyContainer = document.getElementById("history-container");
  const toggleHistoryBtn = document.getElementById("toggle-history");
  const clearHistoryBtn = document.getElementById("clear-history");
  const historyList = document.getElementById("history-list");
  const modeButtons = document.querySelectorAll(".modes button");
  const mcButton = document.querySelector(".modes button:nth-child(1)");
  const mrButton = document.querySelector(".modes button:nth-child(2)");
  const mPlusButton = document.querySelector(".modes button:nth-child(3)");
  const mMinusButton = document.querySelector(".modes button:nth-child(4)");
  const msButton = document.querySelector(".modes button:nth-child(5)");
  const mDropdownButton = document.querySelector(".modes button:nth-child(6)");
  const memoryOverlay = document.getElementById("memory-overlay");
  const memoryContainer = document.getElementById("memory-container");
  const memoryList = document.getElementById("memory-list");
  const clearMemoryBtn = document.getElementById("clear-memory");
  const emptyHistoryMessage = document.getElementById("empty-history");

  let currentInput = "";
  let previousInput = "";
  let operator = null;
  let history = [];
  let memory = [];

  const updateScreen = (value) => (inputField.value = value || "0");
  const updateHistory = (text) => {
    historyField.textContent = text || `${previousInput} ${operator || ""}`;
  };

  const addToHistory = (operation, result) => {
    history.push({ operation, result });
    renderHistory();
  };

  const renderHistory = () => {
    if (history.length === 0) {
      emptyHistoryMessage.style.display = "block";
      clearHistoryBtn.classList.add("hidden");
    } else {
      emptyHistoryMessage.style.display = "none";
      clearHistoryBtn.classList.remove("hidden");
    }
    historyList.innerHTML = history
      .map(
        (entry) =>
          `<li style="font-size:16px;">${entry.operation}</li><li style="font-size:24px; margin-bottom:15px;">${entry.result}</li>`
      )
      .join("");
  };

  clearHistoryBtn.addEventListener("click", () => {
    history = [];
    renderHistory();
  });

  const toggleButtonState = (state) => {
    [mcButton, mrButton, mDropdownButton].forEach((btn) => {
      btn.style.pointerEvents = state ? "auto" : "none";
      btn.style.color = state ? "#000" : "#999";
    });
  };

  const renderMemory = () => {
    memoryList.innerHTML = memory.map((value) => `<li>${value}</li>`).join("");
    if (memory.length === 0) {
      mcButton.style.pointerEvents = "none";
      mrButton.style.pointerEvents = "none";
      mDropdownButton.style.pointerEvents = "none";
      mcButton.style.color =
        mrButton.style.color =
        mDropdownButton.style.color =
          "#999";
    } else {
      mcButton.style.pointerEvents = "auto";
      mrButton.style.pointerEvents = "auto";
      mDropdownButton.style.pointerEvents = "auto";
      mcButton.style.color =
        mrButton.style.color =
        mDropdownButton.style.color =
          "#000";
    }
  };

  const handleModeAction = (action) => {
    switch (action) {
      case "MS":
        if (currentInput) {
          memory.unshift(currentInput);
          toggleButtonState(true);
          renderMemory();
        }
        break;
      case "M+":
      case "M-":
        if (currentInput) {
          memory[0] = memory.length
            ? (action === "M+"
                ? parseFloat(memory[0]) + parseFloat(currentInput)
                : parseFloat(memory[0]) - parseFloat(currentInput)
              ).toString()
            : action === "M+"
            ? currentInput
            : `-${currentInput}`;
        }
        toggleButtonState(true);
        renderMemory();
        break;
      case "MC":
        memory = [];
        renderMemory();
        break;
      case "MR":
        if (memory.length > 0) {
          updateScreen(memory[0]);
          currentInput = memory[0];
        }
        break;
      case "MDropdown":
        memoryContainer.classList.toggle("show");
        memoryOverlay.classList.toggle("show");

        const isMemoryOpen = memoryContainer.classList.contains("show");
        if (isMemoryOpen) {
          [mcButton, mrButton, mPlusButton, mMinusButton, msButton].forEach(
            (btn) => {
              btn.style.pointerEvents = "none";
              btn.style.color = "#999";
            }
          );
        } else {
          renderMemory();
          [mPlusButton, mMinusButton, msButton].forEach((btn) => {
            btn.style.pointerEvents = "auto";
            btn.style.color = "#000";
          });
        }
        break;
      default:
        break;
    }
  };

  modeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;
      handleModeAction(action);
    });
  });

  memoryOverlay.addEventListener("click", () => {
    memoryOverlay.classList.remove("show");
    memoryContainer.classList.remove("show");
    renderMemory();
    [mPlusButton, mMinusButton, msButton].forEach((btn) => {
      btn.style.pointerEvents = "auto";
      btn.style.color = "#000";
    });
  });

  clearMemoryBtn.addEventListener("click", () => {
    memory = [];
    renderMemory();
    toggleButtonState(false);
    [mPlusButton, mMinusButton, msButton].forEach((btn) => {
      btn.style.pointerEvents = "auto";
      btn.style.color = "#000";
    });
    memoryContainer.classList.remove("show");
    memoryOverlay.classList.remove("show");
  });

  const clearAll = () => {
    currentInput = "";
    previousInput = "";
    operator = null;
    updateScreen("0");
    updateHistory("");
  };

  const clearEntry = () => {
    currentInput = "";
    updateScreen("0");
  };

  const handleNumber = (number) => {
    currentInput = operator && !currentInput ? number : currentInput + number;
    updateScreen(currentInput);
  };

  const handleOperator = (op) => {
    if (currentInput) {
      if (previousInput && operator)
        currentInput = calculate(previousInput, currentInput, operator);
      previousInput = currentInput;
      currentInput = "";
    }
    operator = op;
    updateHistory();
  };

  let isSingleOperation = false;

  const singleOperandOperation = (operationLabel, calcFunc) => {
    if (currentInput) {
      const originalValue = currentInput;
      currentInput = calcFunc(parseFloat(currentInput)).toString();
      isSingleOperation = { label: operationLabel, value: originalValue };
      updateScreen(currentInput);
      updateHistory(`${operationLabel}(${originalValue})`);
    }
  };

  const handleEquals = () => {
    let operationString;
    let result;
    if (isSingleOperation) {
      operationString = `${isSingleOperation.label}(${isSingleOperation.value}) =`;
      result = currentInput;
      isSingleOperation = false;
    } else if (currentInput && operator) {
      result = calculate(previousInput, currentInput, operator);
      operationString = `${previousInput} ${operator} ${currentInput} =`;
    } else {
      return;
    }
    addToHistory(operationString, result);
    updateHistory(operationString);
    updateScreen(result);
    previousInput = "";
    operator = null;
    currentInput = result;
  };

  const calculate = (a, b, op) => {
    a = parseFloat(a);
    b = parseFloat(b);
    switch (op) {
      case "+":
        return a + b;
      case "-":
        return a - b;
      case "×":
        return a * b;
      case "÷":
        return b !== 0 ? a / b : "Sıfıra Bölünemez";
      default:
        return b;
    }
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const value = button.innerText.trim();
      if (!isNaN(value)) handleNumber(value);
      else if (["+", "-", "\u00d7", "\u00f7"].includes(value))
        handleOperator(value);
      else if (value === "=") handleEquals();
      else if (value === "C") clearAll();
      else if (value === "CE") clearEntry();
      else if (value === "%") singleOperandOperation("%", (v) => v / 100);
      else if (value === "±") singleOperandOperation("±", (v) => -v);
      else if (value === "x²") singleOperandOperation("sqr", (v) => v * v);
      else if (value === "√x") singleOperandOperation("\u221a", Math.sqrt);
      else if (value === "1/x")
        singleOperandOperation("1/", (v) => (v !== 0 ? 1 / v : "Hata"));
    });
  });

  backspaceButton.addEventListener("click", () => {
    currentInput = currentInput.slice(0, -1);
    updateScreen(currentInput || previousInput || "0");
    updateHistory();
  });

  toggleHistoryBtn.addEventListener("click", () => {
    historyOverlay.classList.toggle("show");
    historyContainer.classList.toggle("show");
  });

  historyOverlay.addEventListener("click", () => {
    historyOverlay.classList.remove("show");
    historyContainer.classList.remove("show");
  });

  renderHistory();
  renderMemory();
});
