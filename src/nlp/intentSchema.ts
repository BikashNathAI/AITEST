/**
 * INTENT SCHEMA
 * Defines the structure of a parsed test instruction
 * Every NLP output must match this shape
 */

export type Action =
  | 'navigate'   // go to a page
  | 'click'      // click an element
  | 'fill'       // type into a field
  | 'assert'     // verify something
  | 'extract'    // get text/value
  | 'wait'       // pause for condition
  | 'hover'      // hover over element
  | 'upload'     // upload a file
  | 'api_call';  // make an API request

export type Domain =
  | 'auth'       // login, logout, register
  | 'product'    // product listing, search
  | 'cart'       // add to cart, remove
  | 'checkout'   // payment, order
  | 'admin'      // admin dashboard
  | 'api'        // API testing
  | 'other';

export type Priority = 'p0' | 'p1' | 'p2';

export type TestType = 'ui' | 'api' | 'database' | 'e2e';

export interface TargetElement {
  description:   string;    // human description
  selector_hint: string;    // testid | role | placeholder | text | css
  value:         string | null;  // exact value if known
}

export interface ParsedIntent {
  action:           Action;
  target_url:       string | null;
  target_element:   TargetElement;
  expected_outcome: string;
  preconditions:    string[];
  domain:           Domain;
  priority:         Priority;
  test_type:        TestType;
  confidence:       number;      // 0.0 – 1.0
  ambiguities:      string[];    // unclear parts
  raw_instruction:  string;      // original text
}

// Confidence threshold — below this, ask for clarification
export const MIN_CONFIDENCE = 0.75;