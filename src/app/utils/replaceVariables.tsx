const replaceVariables = (value: string, insight_instance: any) => {
  const replacedString = value?.replace(
    /{\s*([a-zA-Z0-9_]+)\s*}/g,
    (match: string, arg1: string) => {
      if (insight_instance && arg1 in insight_instance) {
        return String(insight_instance[arg1]);
      }
      return match;
    }
  );
  return replacedString;
};

export default replaceVariables;
