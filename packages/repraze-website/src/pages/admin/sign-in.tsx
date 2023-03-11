import {faCircleNotch} from "@fortawesome/free-solid-svg-icons";
import {zodResolver} from "@hookform/resolvers/zod";
import {Button} from "@repraze/lib-ui/components/button/button";
import {Control, Field, Fields} from "@repraze/lib-ui/components/form/field/field";
import {Help} from "@repraze/lib-ui/components/form/help/help";
import {Input} from "@repraze/lib-ui/components/form/input/input";
import {Label} from "@repraze/lib-ui/components/form/label/label";
import {Icon} from "@repraze/lib-ui/components/icon/icon";
import {Title} from "@repraze/lib-ui/components/title/title";
import {Colors, Widths} from "@repraze/lib-ui/constants";
import {Hero} from "@repraze/lib-ui/layout/hero/hero";
import {Section} from "@repraze/lib-ui/layout/section/section";
import {Wrapper} from "@repraze/lib-ui/layout/wrapper/wrapper";
import {useMutation} from "@tanstack/react-query";
import Head from "next/head";
import {useRouter} from "next/router";
import {useCallback} from "react";
import {SubmitHandler, useForm} from "react-hook-form";
import {z} from "zod";

import {useApi} from "../../components/providers/api";
import {titleFormat} from "../../lib/utils/meta-format";

const LoginForm = z.object({
    username: z.string(),
    password: z.string(),
});

type LoginForm = z.infer<typeof LoginForm>;

export default function LoginView() {
    const router = useRouter();
    const api = useApi();

    const {
        register,
        handleSubmit,
        formState: {isSubmitting},
        reset,
        setFocus,
    } = useForm<LoginForm>({
        mode: "onSubmit",
        reValidateMode: "onSubmit",
        resolver: zodResolver(LoginForm),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    const loginMutation = useMutation({
        mutationFn: async (data: LoginForm) => {
            const basicAuth = {
                username: data.username,
                password: data.password,
            };

            const response = await api.post(`auth/login/basic`, basicAuth);
            const token = response.token;
            api.authenticate(token);
        },
        onError: () => {
            reset({
                password: "",
            });
            setFocus("username");
        },
        onSuccess: () => {
            router.push("/admin");
        },
        useErrorBoundary: false,
    });

    const handleLogin = useCallback<SubmitHandler<LoginForm>>(
        async (data) => {
            try {
                await loginMutation.mutateAsync(data);
            } catch (error) {
                // empty
            }
        },
        [loginMutation]
    );

    return (
        <>
            <Head>
                <title>{titleFormat("Login")}</title>
            </Head>
            <Hero className="dashboard-title">
                <Wrapper width={Widths.Sm}>
                    <Title size={1}>Login</Title>
                </Wrapper>
            </Hero>

            <Section>
                <Wrapper width={Widths.Sm}>
                    <form onSubmit={handleSubmit(handleLogin)}>
                        <Fields>
                            <>
                                <Label htmlFor="username_field">Username</Label>
                                <Field>
                                    <Control expanded>
                                        <Input
                                            id="username_field"
                                            type="text"
                                            placeholder="Username"
                                            autoComplete="username"
                                            color={loginMutation.error ? Colors.Danger : undefined}
                                            autoFocus
                                            {...register("username", {disabled: isSubmitting})}
                                        />
                                    </Control>
                                </Field>
                                {loginMutation.error && (
                                    <Help color={Colors.Danger}>{"Username or password incorrect"}</Help>
                                )}

                                <Label htmlFor="password_field">Password</Label>
                                <Field>
                                    <Control expanded>
                                        <Input
                                            id="password_field"
                                            type="password"
                                            placeholder="Password"
                                            autoComplete="current-password"
                                            color={loginMutation.error ? Colors.Danger : undefined}
                                            {...register("password", {disabled: isSubmitting})}
                                        />
                                    </Control>
                                </Field>
                                {loginMutation.error && (
                                    <Help color={Colors.Danger}>{"Username or password incorrect"}</Help>
                                )}

                                <Field>
                                    <Control expanded>
                                        <Button type="submit" color={Colors.Primary} fullwidth disabled={isSubmitting}>
                                            {isSubmitting ? (
                                                <Icon icon={faCircleNotch} fixedWidth spin />
                                            ) : (
                                                <span>Login</span>
                                            )}
                                        </Button>
                                    </Control>
                                </Field>
                            </>
                        </Fields>
                    </form>
                </Wrapper>
            </Section>
        </>
    );
}
