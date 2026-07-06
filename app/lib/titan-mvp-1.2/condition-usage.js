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

function getEmailAddressesForCondition(emailOutputs, conditionId) {
  return (emailOutputs || [])
    .filter(
      (output) =>
        output.conditionId &&
        String(output.conditionId) === String(conditionId)
    )
    .map((output) => output.emailAddress)
    .filter(Boolean);
}

function enrichConditionsWithUsedInLabels(conditions, formPages, emailOutputs) {
  return (conditions || []).map((condition) => {
    const usedInPages = getPageLabelsForCondition(formPages, condition.id);
    const affectedEmailAddresses = getEmailAddressesForCondition(
      emailOutputs,
      condition.id
    );

    return {
      ...condition,
      usedInPages,
      hasEmailActions: affectedEmailAddresses.length > 0,
    };
  });
}

module.exports = {
  getPageLabelsForCondition,
  getEmailAddressesForCondition,
  enrichConditionsWithUsedInLabels,
};
