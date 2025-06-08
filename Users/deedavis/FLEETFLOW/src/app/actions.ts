// src/app/actions.ts
'use server';

import { revalidatePath } from 'next/cache';

export async function revalidateHomepageAction() {
  try {
    revalidatePath('/', 'layout');
    console.log('Homepage revalidation triggered for / path with layout.');
    return { success: true, message: 'Homepage revalidation triggered successfully!' };
  } catch (error) {
    console.error('Error during revalidation:', error);
    return { success: false, message: 'Failed to trigger homepage revalidation.' };
  }
}
