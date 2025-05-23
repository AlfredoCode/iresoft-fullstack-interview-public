// employeeController.ts
import { Employee } from "@/types/types";
import { BASE_URL, STATIC_TOKEN } from "./api";

export async function createEmployee(employee: Employee) {
  try {
    const response = await fetch(`${BASE_URL}/employees`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${STATIC_TOKEN}`,
      },
      body: JSON.stringify(employee),
    });

    if (!response.ok) {
      throw new Error("Failed to create employee");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function handleUpdateEmployee(
  employeeId: string,
  data: Partial<Employee>
): Promise<Employee> {
  const response = await fetch(`${BASE_URL}/employees/${employeeId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${STATIC_TOKEN}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to update employee");
  }
  return response.json();
}

export async function handleDeleteEmployee(employeeId: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/employees/${employeeId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${STATIC_TOKEN}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to delete employee");
  }
}
