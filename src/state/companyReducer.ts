export interface CompanyState {
  loading: boolean;
  error?: string;
  companies: any[];
}

export type CompanyAction =
  | { type: "LOAD_START" }
  | { type: "LOAD_SUCCESS"; companies: any[] }
  | { type: "LOAD_FAIL"; error: string };

export const initialCompanyState: CompanyState = {
  loading: false,
  companies: [],
};

export function companyReducer(state: CompanyState, action: CompanyAction): CompanyState {
  switch (action.type) {
    case "LOAD_START":
      return { ...state, loading: true, error: undefined };
    case "LOAD_SUCCESS":
      return { loading: false, companies: action.companies, error: undefined };
    case "LOAD_FAIL":
      return { ...state, loading: false, error: action.error };
    default:
      return state;
  }
}
