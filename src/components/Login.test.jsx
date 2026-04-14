import { test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Login from "./login";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});




test("renders login form", () => {

    render(<BrowserRouter>
            <Login />
        </BrowserRouter>);

    expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email Or Username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("**********")).toBeInTheDocument();
});

test("user can type in inputs", async () => {
    render(<BrowserRouter>
            <Login />
        </BrowserRouter>);

    const input = screen.getByPlaceholderText("Email Or Username");

    await userEvent.type(input, "test123");
    expect(input).toHaveValue("test123");
});

test("login success", async () => {
    const mockOnLogin = vi.fn();

      globalThis.fetch = vi.fn(() =>
        Promise.resolve({
            ok: true,
            json: () =>
                Promise.resolve({
                    token: "123",
                    user: { id: "1", username: "test" }
                })
        })
    );


    render(
        <BrowserRouter>
        <Login onLogin={mockOnLogin}/>
        </BrowserRouter>
    );

    await userEvent.type(screen.getByPlaceholderText("Email Or Username"), "test");
    await userEvent.type(screen.getByPlaceholderText("**********"), "12345678");

    await userEvent.click(screen.getByRole("button", { name: "Login" }));

    expect(mockOnLogin).toHaveBeenCalled();
});


test("login fails and shows error", async () => {
    globalThis.fetch = vi.fn(() =>
       Promise.resolve({
          ok: false,
          json: () =>
            Promise.resolve({
                message: "Wrong password"
            })
       })
    )

    render(
        <BrowserRouter>
        <Login />
        </BrowserRouter>
    );

    
    await userEvent.type(screen.getByPlaceholderText("Email Or Username"), "test");
    await userEvent.type(screen.getByPlaceholderText("**********"), "wrong");
    await userEvent.click(screen.getByRole("button", { name: "Login" }));
    
    expect(await screen.findByText("Wrong password")).toBeInTheDocument();

});


test("opens register form", async () => {
    render(
        <BrowserRouter>
        <Login />
        </BrowserRouter>
    );

    await userEvent.click(screen.getByText("Register"));
    expect(screen.getByRole("heading", { name: "Register" })).toBeInTheDocument();
});
