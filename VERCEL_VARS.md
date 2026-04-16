# ONNutrition - Variáveis de Ambiente para Vercel

## NO VERCEL - Settings > Environment Variables

Adicione **3 variáveis** (não valores no nome!):

### Variável 1:

| Campo     | Valor                                      |
| --------- | ------------------------------------------ |
| **Name**  | `NEXT_PUBLIC_SUPABASE_URL`                 |
| **Value** | `https://wyxyqghxtfvmkpanrdhe.supabase.co` |

### Variável 2:

| Campo     | Valor                                            |
| --------- | ------------------------------------------------ |
| **Name**  | `NEXT_PUBLIC_SUPABASE_ANON_KEY`                  |
| **Value** | `sb_publishable_zMA__WPLO2EAtL62vfm50g_a67P62Au` |

### Variável 3:

| Campo     | Valor                                     |
| --------- | ----------------------------------------- |
| **Name**  | `NEXT_PUBLIC_GEMINI_API_KEY`              |
| **Value** | `AIzaSyDcXzZIJIS_yJ7e63gq0QbRpZajTzTCx64` |

---

**ERRO COMUM:** O nome da variável deve ser EXATAMENTE como está acima (sem https://, sem斜杠). O VALOR que contém a URL.

**Deploy:** https://vercel.com > Import Project > ONNutrition
