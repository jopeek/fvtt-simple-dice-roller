class SimpleDiceRoller {
  static _createDiceTableHtmlOneCell(diceType, diceRoll, isLast) {
    let s = [];
    s.push(
      '<li data-dice-type="',
      diceType,
      '" data-dice-roll="',
      diceRoll,
      '"'
    );

    if (diceRoll == 1) {
      s.push(' class="sdr-col1">');

      if (diceType == "f") {
        s.push(
          '<i class="far fa-plus-square" "data-dice-type="',
          diceType,
          '" data-dice-roll="1"></i>'
        );
      } else if (diceType == 100) {
        s.push(
          '<i class="df-d10-10" data-dice-type="',
          diceType,
          '" data-dice-roll="1"></i>'
        );
        s.push(
          '<i class="df-d10-10" data-dice-type="',
          diceType,
          '" data-dice-roll="1"></i>'
        );
      } else {
        s.push(
          '<i class="df-d',
          diceType,
          "-",
          diceType,
          '" data-dice-type="',
          diceType,
          '" data-dice-roll="1"></i>'
        );
      }

      if (diceType == "f") {
        s.push(" Fate");
      } else {
        s.push(" d" + diceType);
      }
    } else if (isLast) {
      s.push(' class="sdr-lastcol">' + diceRoll);
    } else {
      s.push(">" + diceRoll);
    }
    s.push("</li>");

    return s.join("");
  }

  static _createDiceTableHtmlOneLine(diceType, maxDiceCount) {
    let s = [];

    s.push("<ul>");

    for (let i = 1; i <= maxDiceCount; ++i) {
      let isLast = i == maxDiceCount;
      s.push(this._createDiceTableHtmlOneCell(diceType, i, isLast));
    }

    s.push("</ul>");

    return s.join("");
  }

  static _createDiceTableHtml(maxDiceCount, enableFateDice) {
    let s = [];

    s.push(this._createDiceTableHtmlOneLine(2, maxDiceCount));
    s.push(this._createDiceTableHtmlOneLine(4, maxDiceCount));
    s.push(this._createDiceTableHtmlOneLine(6, maxDiceCount));
    s.push(this._createDiceTableHtmlOneLine(8, maxDiceCount));
    s.push(this._createDiceTableHtmlOneLine(10, maxDiceCount));
    s.push(this._createDiceTableHtmlOneLine(12, maxDiceCount));
    s.push(this._createDiceTableHtmlOneLine(20, maxDiceCount));
    s.push(this._createDiceTableHtmlOneLine(100, maxDiceCount));
    if (enableFateDice) {
      s.push(this._createDiceTableHtmlOneLine("f", maxDiceCount));
    }

    return s.join("");
  }

  static _cachedMaxDiceCount = NaN;
  static _cachedEnableFateDice = false;

  static async _createDiceTable(html) {
    console.log("SDR | Creating dice table");
    let maxDiceCount = parseInt(
      game.settings.get("simple-dice-roller", "maxDiceCount"),
      10
    );

    let enableFateDice = Boolean(
      game.settings.get("simple-dice-roller", "enableFateDice")
    );

    if (isNaN(maxDiceCount) || maxDiceCount < 1 || maxDiceCount > 30) {
      maxDiceCount = 5;
    }

    this._cachedMaxDiceCount = maxDiceCount;

    this._cachedEnableFateDice = enableFateDice;

    const tableContentsHtml = this._createDiceTableHtml(
      maxDiceCount,
      enableFateDice
    );

    const tableContents = $(tableContentsHtml);

    html.find("ul").remove();

    html.append(tableContents);

    html.find("li").click((ev) => this._rollDice(ev, html));
  }

  static async _rollDice(event, html) {
    var diceType = event.target.dataset.diceType;
    var diceRoll = event.target.dataset.diceRoll;

    var formula = diceRoll + "d" + diceType;

    let r = new Roll(formula);

    r.toMessage({
      user: game.user._id,
    });

    const $popup = $(".simple-dice-roller-popup");
    $popup.hide();
  }

}

Hooks.on("renderSceneControls", (controls, html) => {
  if (
    !document.querySelector(
      "#scene-controls-layers button[data-control='simple-dice-roller']"
    )
  ) {
    document.querySelector("#scene-controls-layers").insertAdjacentHTML(
      "beforeend",
      `<li>
            <button type="button" class="control ui-control icon fas fa-dice-d20" role="tab" data-action="simple-dice-roller" data-control="simple-dice-roller" data-tooltip="Simple Dice Roller" aria-controls="scene-controls-tools"></button>
            <ol class="sub-controls app control-tools sdr-sub-controls">
                <li id="SDRpopup" class="simple-dice-roller-popup control-tool">
                </li>
            </ol>
        </li>
        `
    );

    console.log("SDR | Simple Dice Roller button added to scene controls");

    // Always use jQuery to select the popup
    const $popup = $(".simple-dice-roller-popup");
    SimpleDiceRoller._createDiceTable($popup);
    $popup.hide();

    document
      .querySelector(
        "#scene-controls-layers button[data-control='simple-dice-roller']"
      )
      .addEventListener("click", (ev) => {
        console.log("SDR | Simple Dice Roller button clicked");
        const $popup = $(".simple-dice-roller-popup");
        // Toggle display between none and block
        if ($popup.is(":visible")) {
          $popup.hide();
        } else {
          $popup.show();
        }
      });
  }
});

Hooks.once("init", () => {
  game.settings.register("simple-dice-roller", "maxDiceCount", {
    name: game.i18n.localize("simpleDiceRoller.maxDiceCount.name"),
    hint: game.i18n.localize("simpleDiceRoller.maxDiceCount.hint"),
    scope: "world",
    config: true,
    default: 8,
    type: Number,
  });
  game.settings.register("simple-dice-roller", "enableFateDice", {
    name: game.i18n.localize("simpleDiceRoller.enableFateDice.name"),
    hint: game.i18n.localize("simpleDiceRoller.enableFateDice.hint"),
    scope: "world",
    config: true,
    default: false,
    type: Boolean,
  });
});

console.log("SDR | Simple Dice Roller loaded");
