function getPageLabelsForCondition(formPages, conditionId) {
  const labels = [];
  let pageCounter = 1;

  (formPages || []).forEach((page) => {
    if (page.conditions) {
      page.conditions.forEach((pageCondition) => {
        if (String(pageCondition.id) === String(conditionId)) {
          const pageLabel = `Page ${pageCounter}`;
          if (!labels.includes(pageLabel)) {
            labels.push(pageLabel);
          }
        }
      });
    }
    pageCounter += 1;
  });

  return labels;
}

function enrichConditionsWithUsedInLabels(conditions, formPages, emailOutputs) {
  return (conditions || []).map((condition) => {
    const usedInPages = getPageLabelsForCondition(formPages, condition.id);
    const hasEmailActions = (emailOutputs || []).some(
      (output) =>
        output.conditionId &&
        String(output.conditionId) === String(condition.id)
    );

    return {
      ...condition,
      usedInPages,
      hasEmailActions,
    };
  });
}

module.exports = {
  getPageLabelsForCondition,
  enrichConditionsWithUsedInLabels,
};
