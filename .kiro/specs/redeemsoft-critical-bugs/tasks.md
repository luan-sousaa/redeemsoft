# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - RedeemSoft Critical Navigation and Data Issues
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bugs exist
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fixes when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the five bugs exist
  - **Scoped PBT Approach**: For deterministic bugs, scope the property to the concrete failing cases to ensure reproducibility
  - Test navigation from DrawerMenu "Chat" option (should fail - route doesn't exist)
  - Test empty Messages tab UX (should show poor UX without explanatory message)
  - Test modalidades type processing (should show inconsistencies between string[] vs string)
  - Test marketplace duplication (should show different behaviors from different routes)
  - Test navigation overlap (should show confusing dual navigation systems)
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bugs exist)
  - Document counterexamples found to understand root causes
  - Mark task complete when test is written, run, and failures are documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Existing RedeemSoft Functionality
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy functionality
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements
  - Test that active conversations with valid contratoId continue working
  - Test that TabNavigation (Início, Projetos, Mensagens, Perfil) operates normally
  - Test that authentication, profile, and project functionalities work unchanged
  - Test that data integrity for candidaturas and contratos is maintained
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 3. Fix for RedeemSoft critical navigation and data bugs
  - [ ] 3.1 Fix DrawerMenu chat navigation
    - Locate DrawerMenu component file
    - Find "Chat" navigation handler
    - Change route from "/(app)/chat" to "/(app)/(tabs)/mensagens"
    - Test that navigation now works correctly
    - _Bug_Condition: isBugCondition(input) where input.type = "DrawerChatClick" from design_
    - _Expected_Behavior: expectedBehavior(result) where chat navigation works from design_
    - _Preservation: TabNavigation and existing chat functionality from design_
    - _Requirements: 2.1, 3.1, 3.2_

  - [ ] 3.2 Improve Messages tab empty state UX
    - Locate Messages tab component (/(app)/(tabs)/mensagens.tsx)
    - Add check for empty conversation list
    - Add explanatory message about needing accepted candidaturas
    - Include link/button to browse projects
    - Ensure UX is clear and helpful
    - _Bug_Condition: isBugCondition(input) where input.type = "MessagesTabEmpty" from design_
    - _Expected_Behavior: expectedBehavior(result) where empty state is informative from design_
    - _Preservation: Existing conversation functionality from design_
    - _Requirements: 2.2, 3.1_

  - [ ] 3.3 Fix modalidades type consistency
    - Audit all uses of modalidades in codebase
    - Standardize to string[] type throughout application
    - Update ProjetoEmpresa interface if needed
    - Fix any API mapping inconsistencies
    - Ensure TypeScript compilation succeeds
    - _Bug_Condition: isBugCondition(input) where input.data.modalidades IS INCONSISTENT_TYPE from design_
    - _Expected_Behavior: expectedBehavior(result) where types are consistent from design_
    - _Preservation: Other data processing functionality from design_
    - _Requirements: 2.3, 2.4, 3.3_

  - [ ] 3.4 Consolidate marketplace implementation
    - Evaluate both marketplace implementations: /(app)/(tabs)/index.tsx vs /(app)/marketplace.tsx
    - Choose primary implementation (recommend /(app)/(tabs)/index.tsx)
    - Remove or redirect duplicate implementation
    - Update all navigation links to use single implementation
    - Ensure consistent marketplace experience
    - _Bug_Condition: isBugCondition(input) where input.hasMultipleImplementations = true from design_
    - _Expected_Behavior: expectedBehavior(result) where single marketplace works from design_
    - _Preservation: Marketplace functionality and project browsing from design_
    - _Requirements: 2.5, 3.2_

  - [ ] 3.5 Clean up navigation architecture
    - Identify where DrawerMenu overlaps with TabNavigation
    - Define clear contexts where each navigation system should be active
    - Remove DrawerMenu from screens that already have TabNavigation
    - Ensure intuitive and unified navigation experience
    - _Bug_Condition: isBugCondition(input) where navigation overlap occurs from design_
    - _Expected_Behavior: expectedBehavior(result) where navigation is unified from design_
    - _Preservation: Core navigation functionality from design_
    - _Requirements: 2.6, 3.2_

  - [ ] 3.6 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - RedeemSoft Critical Fixes Working
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bugs are fixed)
    - _Requirements: Expected Behavior Properties from design_

  - [ ] 3.7 Verify preservation tests still pass
    - **Property 2: Preservation** - Existing RedeemSoft Functionality
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fixes (no regressions)

- [ ] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
