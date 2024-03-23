export const testUser1 = {
	id: 1,
	email: "testuser1@test.com",
	firstName: "test",
	lastName: "user",
	password: "password1!",
	username: "testuser1"
};

export const testUser2 = {
	id: 2,
	email: "testuser2@test.com",
	firstName: "test",
	lastName: "user",
	password: "password2!",
	username: "testuser2"
};

export const testUserDuplicateEmail = {
	email: "testuser1@test.com",
	firstName: "test",
	lastName: "user",
	password: "password3!",
	username: "testuser3"
};

export const testUserDuplicateUsername = {
	email: "testuser3@test.com",
	firstName: "test",
	lastName: "user",
	password: "password3!",
	username: "testuser1"
};

export const testUserMissingField = {
	email: "testuser3@test.com",
	firstName: "test",
	password: "password3!",
	username: "testuser3"
};

export const testUserMultipleFailures = {
	email: "testuser3@test",
	lastName: "user3",
	password: "password3!",
	username: "testuser1"
};
