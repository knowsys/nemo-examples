class StringFormatter {
  private static instance: StringFormatter;

  private constructor() {}

  public static getInstance(): StringFormatter {
    if (!StringFormatter.instance) {
      StringFormatter.instance = new StringFormatter();
    }
    return StringFormatter.instance;
  }

  formatPredicate(name: string, parameter?: string[]): string {
  return name + `(${Array.isArray(parameter) ? parameter.join(",") : ""})`;
}

  public formatFact(fact: string): string {
    return fact;
  }

  public formatRuleName(name: string): string {
    return name;
  }

}

export default StringFormatter.getInstance();