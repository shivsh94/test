interface Condition {
  show: boolean;
  values: string[];
  operation: "in" | "not_in";
  value_type: "value" | "field";
  options?: string[];
}

export function Show({
  attribute,
  formValues,
}: {
  attribute: any;
  formValues: Record<string, any>;
}): boolean {
  console.log(formValues);
  if (!attribute.context?.conditions) {
    return true;
  }

  const conditions = attribute.context.conditions;

  for (const [fieldName, conditionRules] of Object.entries(conditions)) {
    if (!Array.isArray(conditionRules)) continue;

    let fieldValue;
    if (
      typeof formValues[fieldName] === "object" &&
      formValues[fieldName] !== null &&
      "value" in formValues[fieldName]
    ) {
      fieldValue = formValues[fieldName].value;
    } else {
      fieldValue = formValues[fieldName];
    }

    for (const rule of conditionRules as Condition[]) {
      if (rule.value_type !== "field") continue;

      if (fieldValue === undefined || fieldValue === "") {
        continue;
      }

      const isIncluded = rule.values.includes(fieldValue);

      if (rule.operation === "in") {
        if (isIncluded) {
          return rule.show;
        } else {
          return !rule.show;
        }
      } else if (rule.operation === "not_in") {
        if (!isIncluded) {
          return rule.show;
        } else {
          return !rule.show;
        }
      }
    }
  }

  return true;
}

export function Options({
  options,
  formValues,
  attribute,
}: {
  options: any;
  formValues: Record<string, any>;
  attribute: any;
}) {
  if (!attribute.context?.conditions) {
    return options || {};
  }

  const conditions = attribute.context.conditions;

  for (const [fieldName, conditionRules] of Object.entries(conditions)) {
    if (!Array.isArray(conditionRules)) continue;

    let fieldValue;
    if (
      typeof formValues[fieldName] === "object" &&
      formValues[fieldName] !== null &&
      "value" in formValues[fieldName]
    ) {
      fieldValue = formValues[fieldName].value;
    } else {
      fieldValue = formValues[fieldName];
    }

    for (const rule of conditionRules as Condition[]) {
      if (rule.value_type !== "value") continue;

      if (fieldValue === undefined || fieldValue === "") {
        continue;
      }

      const isIncluded = rule.values.includes(fieldValue);

      if (rule.operation === "in") {
        if (isIncluded) {
          return (
            Object.fromEntries(
              rule.options?.map((option) => [option, options[option]]) || []
            ) || {}
          );
        } else {
          return options || {};
        }
      } else if (rule.operation === "not_in") {
        if (!isIncluded) {
          return (
            Object.fromEntries(
              rule.options?.map((option) => [option, options[option]]) || []
            ) || {}
          );
        } else {
          return options || {};
        }
      }
    }
  }

  return options;
}
