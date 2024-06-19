export const testUser1 = {
	id: 1,
	email: "testuser1@test.com",
	firstName: "Test",
	lastName: "User",
	password: "password1!",
	username: "testuser1",
};

export const testUser2 = {
	id: 2,
	email: "testuser2@test.com",
	firstName: "Test",
	lastName: "User",
	password: "password2!",
	username: "testuser2",
};

export const testUser3 = {
	id: 3,
	email: "testuser3@test.com",
	firstName: "Test",
	lastName: "User",
	password: "password3!",
	username: "testuser3",
};

export const testUserDuplicateEmail = {
	id: 4,
	email: "testuser1@test.com",
	firstName: "Test",
	lastName: "User",
	password: "password3!",
	username: "testuser3",
};

export const testUserDuplicateUsername = {
	id: 5,
	email: "testuser4@test.com",
	firstName: "Test",
	lastName: "User",
	password: "password4!",
	username: "testuser1",
};

export const testUserMissingField = {
	id: 6,
	email: "testuser5@test.com",
	firstName: "Test",
	password: "password5!",
	username: "testuser5",
};

export const testUserMultipleFailures = {
	id: 7,
	email: "testuser6@test",
	lastName: "User6",
	password: "password6!",
	username: "testuser1",
};
