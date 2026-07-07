/**
 * Inclusive ("select all") checkbox behaviour based on NHS.UK Frontend PR #1707.
 * https://github.com/nhsuk/nhsuk-frontend/pull/1707
 */
class InclusiveCheckboxes {
  constructor($root) {
    if (
      !($root instanceof HTMLElement) ||
      !document.body.classList.contains("govuk-frontend-supported")
    ) {
      return;
    }

    this.$root = $root;
    this.$root
      .querySelectorAll(".app-inclusive-checkboxes--js-only")
      .forEach(($element) => {
        $element.classList.remove("app-inclusive-checkboxes--js-only");
      });
    this.$root.addEventListener("click", (event) => this.handleClick(event));
  }

  getGroup($input, behaviour) {
    return $input.dataset.behaviourGroup || null;
  }

  getGroupSelector($input, behaviour) {
    const behaviourGroup = this.getGroup($input, behaviour);

    if (!behaviourGroup) {
      return `[name="${$input.name}"]`;
    }

    return `[data-behaviour-group="${behaviourGroup}"]`;
  }

  getGroupInputs($behaviourInput, behaviour) {
    const groupSelector = this.getGroupSelector($behaviourInput, behaviour);
    const $groupInputs = this.$root.querySelectorAll(
      `input[type="checkbox"]${groupSelector}`
    );

    return Array.from($groupInputs).filter(
      ($input) =>
        $input.form === $behaviourInput.form && $input !== $behaviourInput
    );
  }

  getBehaviourInputs($input, behaviour) {
    const groupSelector = this.getGroupSelector($input, behaviour);
    const $behaviourInputs = this.$root.querySelectorAll(
      `input[type="checkbox"][data-behaviour="${behaviour}"]${groupSelector}`
    );

    return Array.from($behaviourInputs).filter(
      ($behaviourInput) => $input.form === $behaviourInput.form
    );
  }

  setInputState($input, checked, behaviourGroup) {
    const group = $input.dataset.behaviourGroup;

    if (group && behaviourGroup && group !== behaviourGroup) {
      return;
    }

    $input.checked = checked;
  }

  unCheckAllInputsExcept($behaviourInput, behaviour = "exclusive") {
    const behaviourGroup = this.getGroup($behaviourInput, behaviour);
    const $groupInputs = this.getGroupInputs($behaviourInput, behaviour);

    $groupInputs.forEach(($input) => {
      this.setInputState($input, false, behaviourGroup);
    });
  }

  unCheckInputs($input, behaviour = "exclusive") {
    const behaviourGroup = this.getGroup($input, behaviour);
    const $behaviourInputs = this.getBehaviourInputs($input, behaviour);

    $behaviourInputs.forEach(($behaviourInput) => {
      this.setInputState($behaviourInput, false, behaviourGroup);
    });
  }

  checkAllInputsExcept($behaviourInput, behaviour = "inclusive") {
    const behaviourGroup = this.getGroup($behaviourInput, behaviour);
    const $groupInputs = this.getGroupInputs($behaviourInput, behaviour);

    $groupInputs.forEach(($input) => {
      this.setInputState($input, true, behaviourGroup);
    });
  }

  checkInputs($input, behaviour = "inclusive") {
    const behaviourGroup = this.getGroup($input, behaviour);
    const $behaviourInputs = this.getBehaviourInputs($input, behaviour);

    $behaviourInputs.forEach(($behaviourInput) => {
      const $groupInputs = this.getGroupInputs($behaviourInput, behaviour);
      const allChecked = $groupInputs.every(($groupInput) => $groupInput.checked);

      if (allChecked) {
        this.setInputState($behaviourInput, true, behaviourGroup);
      }
    });
  }

  handleClick(event) {
    const $clickedInput = event.target;

    if (
      !($clickedInput instanceof HTMLInputElement) ||
      $clickedInput.type !== "checkbox"
    ) {
      return;
    }

    const isExclusive = $clickedInput.dataset.behaviour === "exclusive";
    const isInclusive = $clickedInput.dataset.behaviour === "inclusive";

    if (isExclusive) {
      if ($clickedInput.checked) {
        this.unCheckAllInputsExcept($clickedInput, "exclusive");
      }
    } else if (isInclusive) {
      if ($clickedInput.checked) {
        this.checkAllInputsExcept($clickedInput, "inclusive");
      } else {
        this.unCheckAllInputsExcept($clickedInput, "inclusive");
      }
    } else if ($clickedInput.checked) {
      this.checkInputs($clickedInput, "inclusive");
      this.unCheckInputs($clickedInput, "exclusive");
    } else {
      this.unCheckInputs($clickedInput, "inclusive");
    }
  }
}

document
  .querySelectorAll('[data-module="inclusive-checkboxes"]')
  .forEach(($root) => {
    new InclusiveCheckboxes($root);
  });
