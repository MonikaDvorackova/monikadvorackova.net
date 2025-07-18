import React from 'react'

export default function Booking() {
    return (
    <section className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Book a consultation</h2>
        <div className="w-full h-[600px]">
        <iframe
            src="https://calendly.com/monika-dvorackova/consultation"
            width="100%"
            height="100%"
            frameBorder="0"
            className="border"
        />
        </div>
    </section>
    )
}