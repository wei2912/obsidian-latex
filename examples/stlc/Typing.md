Using **Extended MathJax** we can make use of packages such as `bussproofs` to typeset proof rules, for example below we include the rules for the Simply Typed Lambda Calculus.

This example makes use a custom `\typing` macro to typeset typing judgements.

$$
\begin{prooftree}
\AxiomC{$\typing[x : A, \Gamma]{M}{B}$}
\RL{(T-ABS)}
\UnaryInfC{$\typing{\lambda x. M}{A \rightarrow B}$}
\end{prooftree}
$$

$$
\begin{prooftree}
\AxiomC{$\typing{M}{A \rightarrow B}$}
\AxiomC{$\typing{N}{A}$}
\RL{(T-APP)}
\BinaryInfC{$\typing{M~N}{B}$}
\end{prooftree}
$$

$$
\begin{prooftree}
\AxiomC{$x : A \in \Gamma$}
\RL{(T-VAR)}
\UnaryInfC{$\typing{x}{A}$}
\end{prooftree}
$$