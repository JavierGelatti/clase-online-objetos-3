export function esperar(milisegundos: number) {
    return new Promise(resolve => setTimeout(resolve, milisegundos));
}