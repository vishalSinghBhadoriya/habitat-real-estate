import {type PropsWithChildren} from 'react'
import {Provider} from 'react-redux'
import {QueryClient,QueryClientProvider} from '@tanstack/react-query'
import {store} from './store'
import '@/locales/i18n'
const client=new QueryClient({defaultOptions:{queries:{staleTime:60_000,retry:1}}})
export function Providers({children}:PropsWithChildren){return <Provider store={store}><QueryClientProvider client={client}>{children}</QueryClientProvider></Provider>}
