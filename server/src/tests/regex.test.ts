import { test, describe, vi, expect } from "vitest";
import { firstNameExp, lastNameExp, passwordExp } from "../schemas/user.schema";

describe("Regex associated with registering a new user.", async () => {
	test("Test first name regex.", async () => {
		expect("Testfirstname").toMatch(firstNameExp);
		expect("testFIRSTname").toMatch(firstNameExp);
		expect("test firstname").toMatch(firstNameExp);
		expect("Test first name").not.toMatch(firstNameExp);
		expect("Test-firstname").toMatch(firstNameExp);
		expect("Test-first name").not.toMatch(firstNameExp);
		expect("T estfirstname").not.toMatch(firstNameExp);
		expect("Testfirstnam e").not.toMatch(firstNameExp);
		expect("Test -firstname").not.toMatch(firstNameExp);
		expect("Testfirstname1").not.toMatch(firstNameExp);
		expect("Testfirstname!").not.toMatch(firstNameExp);
	
	});
	test("Test last name regex.", async () => {
		expect("T").not.toMatch(lastNameExp);
		expect("Te").toMatch(lastNameExp);
		expect("Testlastname").toMatch(lastNameExp);
		expect("testLASTname").toMatch(lastNameExp);
		expect("Test-last-name").toMatch(lastNameExp);
		expect("Test-la-st-name").not.toMatch(lastNameExp);
		expect("Test lastname").toMatch(lastNameExp);
		expect("Test last name").toMatch(lastNameExp);
		expect("Test l astname").not.toMatch(lastNameExp);
		expect("T estlastname").not.toMatch(lastNameExp);
		expect("Testlastnam e").not.toMatch(lastNameExp);
		expect("Test la st name").not.toMatch(lastNameExp);
		expect("Test last-name").not.toMatch(lastNameExp);
		expect("Testlast -name").not.toMatch(lastNameExp);
		expect("Testlastname1").not.toMatch(lastNameExp);
		expect("Testlastname!").not.toMatch(lastNameExp);
		expect("T'estlastname").toMatch(lastNameExp)					
		expect("Te'stlastname").not.toMatch(lastNameExp)
		expect("T'estlas'tname").not.toMatch(lastNameExp)
		expect("T'estlast N'ame").toMatch(lastNameExp)
		expect("T'estlast-N'ame").toMatch(lastNameExp)
		expect("T'estL'ast N'ame").not.toMatch(lastNameExp)
		expect("T'est L'astN'ame").not.toMatch(lastNameExp)
		expect("T'est L'ast N'ame").toMatch(lastNameExp)
		expect("T'est-L'ast-N'ame").toMatch(lastNameExp)
	});
	test("Test password regex.", async () => {
		expect("Testpassword1!").toMatch(passwordExp);
		expect("Testpassword1\\").toMatch(passwordExp);
		expect("Testpassword1.").toMatch(passwordExp);
		expect("Test*password1").toMatch(passwordExp);
		expect("Test1password1!").toMatch(passwordExp);
		expect("testpassword1").not.toMatch(passwordExp);
		expect("testpassword!").not.toMatch(passwordExp);
		expect("test password1!").not.toMatch(passwordExp);
		expect("test\npassword1!").not.toMatch(passwordExp);
		expect("12!?*.^345").not.toMatch(passwordExp);
		expect("12345").not.toMatch(passwordExp);
		expect('!?*.^"').not.toMatch(passwordExp);
		expect("testpassword").not.toMatch(passwordExp);
		expect("testpassword!?*.^").not.toMatch(passwordExp);
	});
});
