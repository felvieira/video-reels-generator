import { useEffect, useState } from "react"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
}

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

const toastTimeouts = new Map()

function addToRemoveQueue(toastId) {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export function useToast() {
  const [state, setState] = useState({ toasts: [] })

  useEffect(() => {
    state.toasts.forEach((toast) => {
      if (toast.open) {
        addToRemoveQueue(toast.id)
      }
    })
  }, [state.toasts])

  function toast({ ...props }) {
    const id = genId()

    const update = (props) =>
      setState((state) => ({
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === id ? { ...t, ...props } : t
        ),
      }))
    const dismiss = () => setState((state) => ({
      ...state,
      toasts: state.toasts.filter((t) => t.id !== id),
    }))

    setState((state) => ({
      ...state,
      toasts: [
        { id, title: "", ...props, open: true, update, dismiss },
        ...state.toasts,
      ].slice(0, TOAST_LIMIT),
    }))

    return {
      id: id,
      dismiss,
      update,
    }
  }

  return {
    toast,
    toasts: state.toasts,
  }
} 