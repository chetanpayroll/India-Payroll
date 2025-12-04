import { Employee, PayrollRun } from '@prisma/client';

const API_BASE = '/api';

export const api = {
    employees: {
        getAll: async (params?: { query?: string; department?: string; status?: string }) => {
            const searchParams = new URLSearchParams();
            if (params?.query) searchParams.append('query', params.query);
            if (params?.department) searchParams.append('department', params.department);
            if (params?.status) searchParams.append('status', params.status);

            const response = await fetch(`${API_BASE}/employees?${searchParams.toString()}`);
            if (!response.ok) throw new Error('Failed to fetch employees');
            return response.json() as Promise<Employee[]>;
        },

        getById: async (id: string) => {
            const response = await fetch(`${API_BASE}/employees/${id}`);
            if (!response.ok) throw new Error('Failed to fetch employee');
            return response.json() as Promise<Employee>;
        },

        create: async (data: Partial<Employee>) => {
            const response = await fetch(`${API_BASE}/employees`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to create employee');
            return response.json() as Promise<Employee>;
        },

        update: async (id: string, data: Partial<Employee>) => {
            const response = await fetch(`${API_BASE}/employees/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to update employee');
            return response.json() as Promise<Employee>;
        },

        delete: async (id: string) => {
            const response = await fetch(`${API_BASE}/employees/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete employee');
        },
    },

    payroll: {
        getAll: async (params?: { year?: number; month?: number }) => {
            const searchParams = new URLSearchParams();
            if (params?.year) searchParams.append('year', params.year.toString());
            if (params?.month) searchParams.append('month', params.month.toString());

            const response = await fetch(`${API_BASE}/payroll?${searchParams.toString()}`);
            if (!response.ok) throw new Error('Failed to fetch payroll runs');
            return response.json() as Promise<PayrollRun[]>;
        },

        getById: async (id: string) => {
            const response = await fetch(`${API_BASE}/payroll/${id}`);
            if (!response.ok) throw new Error('Failed to fetch payroll run');
            return response.json() as Promise<PayrollRun>;
        },

        create: async (data: Partial<PayrollRun>) => {
            const response = await fetch(`${API_BASE}/payroll`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to create payroll run');
            return response.json() as Promise<PayrollRun>;
        },

        update: async (id: string, data: Partial<PayrollRun>) => {
            const response = await fetch(`${API_BASE}/payroll/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to update payroll run');
            return response.json() as Promise<PayrollRun>;
        },

        delete: async (id: string) => {
            const response = await fetch(`${API_BASE}/payroll/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete payroll run');
        },
    },
};
